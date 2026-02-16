import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, addDays } from 'date-fns';
import { useStore } from '../../store/useStore';
import { forecast } from '../../utils/forecast';
import { filterDataByDateRange } from '../../utils/formatters';
import { formatCurrency } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

export default function ProfitForecast() {
  const dateRange = useStore((state) => state.dateRange);
  const shopifyData = useStore((state) => state.shopifyData);

  const forecast_data = useMemo(() => {
    const historicalData = filterDataByDateRange(shopifyData || [], dateRange);

    if (historicalData.length === 0) {
      return {
        conservative: {},
        expected: {},
        optimistic: {},
        cashFlowData: [],
      };
    }

    // Calculate 30-day aggregates
    const last30days = historicalData.slice(-30);

    const totalRevenue = last30days.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalCOGS = last30days.reduce((sum, d) => sum + (d.cogs || 0), 0);
    const totalShipping = last30days.reduce((sum, d) => sum + (d.shipping || 0), 0);
    const totalTransactionFees = last30days.reduce((sum, d) => sum + (d.transactionFees || 0), 0);
    const avgDailyRevenue = totalRevenue / Math.max(1, last30days.length);

    // Run forecast for next 30 days
    const dataForForecast = historicalData.map((d) => ({
      date: d.date,
      value: d.revenue,
    }));

    const revenueF = forecast(dataForForecast, 30, {
      method: 'auto',
      confidence: 0.95,
    });

    // Calculate projections
    const projected30d = {
      revenue: revenueF.values.reduce((sum, v) => sum + v.predicted, 0),
      lower: revenueF.values.reduce((sum, v) => sum + v.lower, 0),
      upper: revenueF.values.reduce((sum, v) => sum + v.upper, 0),
    };

    // Fixed and variable costs
    const fixedCosts = useStore.getState().fixedCosts || [];
    const totalMonthlyFixed = fixedCosts.reduce((sum, c) => (c.isActive ? sum + c.monthlyAmount : 0), 0);

    const cogsPercentage = totalRevenue > 0 ? totalCOGS / totalRevenue : 0.35;
    const shippingPercentage = totalRevenue > 0 ? totalShipping / totalRevenue : 0.08;
    const feesPercentage = totalRevenue > 0 ? totalTransactionFees / totalRevenue : 0.029;

    // Ad spend (assuming Meta + Google = 27.5k/month)
    const monthlyAdSpend = 27500;

    const platformCosts = 800;
    const otherCosts = 1200;

    // Three scenarios
    const scenarios = {
      conservative: {
        revenue: projected30d.lower,
        cogs: projected30d.lower * cogsPercentage,
        shipping: projected30d.lower * shippingPercentage,
        adSpend: monthlyAdSpend,
        platformCosts,
        transactionFees: projected30d.lower * feesPercentage,
        otherCosts,
        fixedCosts: totalMonthlyFixed,
      },
      expected: {
        revenue: projected30d.revenue,
        cogs: projected30d.revenue * cogsPercentage,
        shipping: projected30d.revenue * shippingPercentage,
        adSpend: monthlyAdSpend,
        platformCosts,
        transactionFees: projected30d.revenue * feesPercentage,
        otherCosts,
        fixedCosts: totalMonthlyFixed,
      },
      optimistic: {
        revenue: projected30d.upper,
        cogs: projected30d.upper * cogsPercentage,
        shipping: projected30d.upper * shippingPercentage,
        adSpend: monthlyAdSpend,
        platformCosts,
        transactionFees: projected30d.upper * feesPercentage,
        otherCosts,
        fixedCosts: totalMonthlyFixed,
      },
    };

    // Calculate net profit for each scenario
    for (const [key, scenario] of Object.entries(scenarios)) {
      scenario.totalCosts =
        scenario.cogs +
        scenario.shipping +
        scenario.transactionFees +
        scenario.adSpend +
        scenario.platformCosts +
        scenario.otherCosts +
        scenario.fixedCosts;

      scenario.netProfit = scenario.revenue - scenario.totalCosts;
      scenario.netMargin = scenario.revenue > 0 ? (scenario.netProfit / scenario.revenue) * 100 : 0;
    }

    // Generate daily cash flow data for next 60 days
    const cashFlowData = [];
    let cumulativeCashFlow = 0;

    const dailyRevenue = projected30d.revenue / 30;
    const dailyCOGS = (projected30d.revenue * cogsPercentage) / 30;
    const dailyShipping = (projected30d.revenue * shippingPercentage) / 30;
    const dailyFees = (projected30d.revenue * feesPercentage) / 30;
    const dailyAdSpend = monthlyAdSpend / 30;
    const dailyPlatformCosts = platformCosts / 30;
    const dailyOtherCosts = otherCosts / 30;
    const dailyFixedCosts = totalMonthlyFixed / 30;

    let currentDate = new Date(last30days[last30days.length - 1].date);

    for (let i = 0; i < 60; i++) {
      currentDate = addDays(currentDate, 1);
      const dailyNetCash = dailyRevenue - dailyCOGS - dailyShipping - dailyFees - dailyAdSpend - dailyPlatformCosts - dailyOtherCosts - dailyFixedCosts;
      cumulativeCashFlow += dailyNetCash;

      cashFlowData.push({
        date: format(currentDate, 'MMM d'),
        cumulativeCashFlow,
        dailyRevenue,
      });
    }

    return {
      conservative: scenarios.conservative,
      expected: scenarios.expected,
      optimistic: scenarios.optimistic,
      cashFlowData,
      breakEvenDaily: monthlyAdSpend / 30 / (1 - cogsPercentage - shippingPercentage - feesPercentage),
    };
  }, [dateRange]);

  const rows = [
    { label: 'Revenue', key: 'revenue' },
    { label: 'COGS', key: 'cogs' },
    { label: 'Ad Spend', key: 'adSpend' },
    { label: 'Platform Costs', key: 'platformCosts' },
    { label: 'Shipping', key: 'shipping' },
    { label: 'Transaction Fees', key: 'transactionFees' },
    { label: 'Fixed Costs', key: 'fixedCosts' },
    { label: 'Other Costs', key: 'otherCosts' },
    { label: 'Net Profit', key: 'netProfit', isProfit: true },
    { label: 'Net Margin %', key: 'netMargin', isMargin: true },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-slate-800 border border-slate-700 rounded p-3 shadow-lg">
        <p className="text-slate-300 text-sm">{payload[0].payload.date}</p>
        <p className="text-purple-400 font-medium">
          Cumulative: {formatCurrency(payload[0].payload.cumulativeCashFlow)}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-100">P&L Forecast</h3>
        <p className="text-sm text-slate-400 mt-1">30-day profit & loss projection</p>
      </div>

      {/* Scenarios Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-2 px-3 text-slate-300 font-semibold">Metric</th>
              <th className="text-right py-2 px-3 text-slate-300 font-semibold">Conservative</th>
              <th className="text-right py-2 px-3 text-slate-300 font-semibold">Expected</th>
              <th className="text-right py-2 px-3 text-slate-300 font-semibold">Optimistic</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`border-b border-slate-700/30 ${
                  row.isProfit || row.isMargin
                    ? 'bg-slate-700/20 font-semibold'
                    : idx % 2 === 0
                    ? 'bg-slate-800/20'
                    : ''
                }`}
              >
                <td className="py-2 px-3 text-slate-200">{row.label}</td>
                <td
                  className={`py-2 px-3 text-right ${
                    row.isProfit
                      ? forecast_data.conservative.netProfit > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                      : 'text-slate-100'
                  }`}
                >
                  {row.isMargin
                    ? `${forecast_data.conservative[row.key]?.toFixed(1) || '0'}%`
                    : formatCurrency(forecast_data.conservative[row.key] || 0)}
                </td>
                <td
                  className={`py-2 px-3 text-right ${
                    row.isProfit
                      ? forecast_data.expected.netProfit > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                      : 'text-slate-100'
                  }`}
                >
                  {row.isMargin
                    ? `${forecast_data.expected[row.key]?.toFixed(1) || '0'}%`
                    : formatCurrency(forecast_data.expected[row.key] || 0)}
                </td>
                <td
                  className={`py-2 px-3 text-right ${
                    row.isProfit
                      ? forecast_data.optimistic.netProfit > 0
                        ? 'text-green-400'
                        : 'text-red-400'
                      : 'text-slate-100'
                  }`}
                >
                  {row.isMargin
                    ? `${forecast_data.optimistic[row.key]?.toFixed(1) || '0'}%`
                    : formatCurrency(forecast_data.optimistic[row.key] || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cash Flow Chart */}
      <div className="border-t border-slate-700/50 pt-6 flex-1">
        <h4 className="text-sm font-semibold text-slate-100 mb-4">Cumulative Cash Flow (60 days)</h4>
        <div className="h-48">
          {forecast_data.cashFlowData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={forecast_data.cashFlowData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.BLUE[500]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.BLUE[500]} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  stroke="#475569"
                />
                <YAxis
                  tick={{ fill: '#cbd5e1', fontSize: 12 }}
                  tickFormatter={(value) => `$${Math.round(value / 1000)}K`}
                  stroke="#475569"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulativeCashFlow"
                  fill="url(#colorCashFlow)"
                  stroke={COLORS.BLUE[500]}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
