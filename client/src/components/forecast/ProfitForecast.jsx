import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, addDays } from 'date-fns';
import { useStore } from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { forecast } from '../../utils/forecast';
import { formatCurrency } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

export default function ProfitForecast() {
  const { colors } = useTheme();
  const shopifyData = useStore((state) => state.shopifyData);
  const googleData = useStore((state) => state.googleData);
  const metaData = useStore((state) => state.metaData);

  const forecast_data = useMemo(() => {
    // Use ALL historical data for better forecasting
    const historicalData = shopifyData || [];

    if (historicalData.length === 0) {
      return {
        conservative: {},
        expected: {},
        optimistic: {},
        cashFlowData: [],
      };
    }

    const last30days = historicalData.slice(-30);

    const totalRevenue = last30days.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const totalCOGS = last30days.reduce((sum, d) => sum + (d.cogs || 0), 0);
    const totalShipping = last30days.reduce((sum, d) => sum + (d.shipping || 0), 0);
    const totalTransactionFees = last30days.reduce((sum, d) => sum + (d.transactionFees || 0), 0);

    // Calculate actual ad spend from connected platforms
    const metaSpend = (metaData || []).slice(-30).reduce((sum, d) => sum + (d.spend || 0), 0);
    const googleSpend = (googleData || []).slice(-30).reduce((sum, d) => sum + (d.spend || d.cost || 0), 0);
    const totalAdSpend = metaSpend + googleSpend;

    // Use ALL data for forecast
    const dataForForecast = historicalData.map((d) => ({
      date: d.date,
      value: d.revenue,
    }));

    const revenueF = forecast(dataForForecast, 30, {
      method: 'auto',
      confidence: 0.95,
    });

    const projected30d = {
      revenue: revenueF.values.reduce((sum, v) => sum + v.predicted, 0),
      lower: revenueF.values.reduce((sum, v) => sum + v.lower, 0),
      upper: revenueF.values.reduce((sum, v) => sum + v.upper, 0),
    };

    const fixedCosts = useStore.getState().fixedCosts || [];
    const totalMonthlyFixed = fixedCosts.reduce((sum, c) => (c.isActive ? sum + c.monthlyAmount : 0), 0);

    const cogsPercentage = totalRevenue > 0 ? totalCOGS / totalRevenue : 0.35;
    const feesPercentage = totalRevenue > 0 ? totalTransactionFees / totalRevenue : 0.029;

    // Use real ad spend data from connected platforms
    const monthlyAdSpend = totalAdSpend;

    const platformCosts = 800;
    const otherCosts = 1200;

    const scenarios = {
      conservative: {
        revenue: projected30d.lower,
        cogs: projected30d.lower * cogsPercentage,
        shipping: 0,
        adSpend: monthlyAdSpend,
        platformCosts,
        transactionFees: projected30d.lower * feesPercentage,
        otherCosts,
        fixedCosts: totalMonthlyFixed,
      },
      expected: {
        revenue: projected30d.revenue,
        cogs: projected30d.revenue * cogsPercentage,
        shipping: 0,
        adSpend: monthlyAdSpend,
        platformCosts,
        transactionFees: projected30d.revenue * feesPercentage,
        otherCosts,
        fixedCosts: totalMonthlyFixed,
      },
      optimistic: {
        revenue: projected30d.upper,
        cogs: projected30d.upper * cogsPercentage,
        shipping: 0,
        adSpend: monthlyAdSpend,
        platformCosts,
        transactionFees: projected30d.upper * feesPercentage,
        otherCosts,
        fixedCosts: totalMonthlyFixed,
      },
    };

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
    const dailyFees = (projected30d.revenue * feesPercentage) / 30;
    const dailyAdSpend = monthlyAdSpend / 30;
    const dailyPlatformCosts = platformCosts / 30;
    const dailyOtherCosts = otherCosts / 30;
    const dailyFixedCosts = totalMonthlyFixed / 30;

    let currentDate = new Date(last30days[last30days.length - 1].date);

    for (let i = 0; i < 60; i++) {
      currentDate = addDays(currentDate, 1);
      const dailyNetCash = dailyRevenue - dailyCOGS - dailyFees - dailyAdSpend - dailyPlatformCosts - dailyOtherCosts - dailyFixedCosts;
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
      breakEvenDaily: monthlyAdSpend / 30 / (1 - cogsPercentage - feesPercentage),
    };
  }, [shopifyData, googleData, metaData]);

  const rows = [
    { label: 'Revenue', key: 'revenue' },
    { label: 'COGS', key: 'cogs' },
    { label: 'Ad Spend', key: 'adSpend' },
    { label: 'Platform Costs', key: 'platformCosts' },
    { label: 'Transaction Fees', key: 'transactionFees' },
    { label: 'Fixed Costs', key: 'fixedCosts' },
    { label: 'Other Costs', key: 'otherCosts' },
    { label: 'Net Profit', key: 'netProfit', isProfit: true },
    { label: 'Net Margin %', key: 'netMargin', isMargin: true },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload) return null;

    return (
      <div className="rounded p-3 shadow-lg" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <p className="text-sm" style={{ color: colors.textSecondary }}>{payload[0].payload.date}</p>
        <p className="text-purple-400 font-medium">
          Cumulative: {formatCurrency(payload[0].payload.cumulativeCashFlow)}
        </p>
      </div>
    );
  };

  return (
    <div className="backdrop-blur rounded-xl p-6 h-full flex flex-col" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>P&L Forecast</h3>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>30-day profit & loss projection</p>
      </div>

      {/* Scenarios Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <th className="text-left py-2 px-3 font-semibold" style={{ color: colors.textSecondary }}>Metric</th>
              <th className="text-right py-2 px-3 font-semibold" style={{ color: colors.textSecondary }}>Conservative</th>
              <th className="text-right py-2 px-3 font-semibold" style={{ color: colors.textSecondary }}>Expected</th>
              <th className="text-right py-2 px-3 font-semibold" style={{ color: colors.textSecondary }}>Optimistic</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: `1px solid ${colors.border}`,
                  backgroundColor: (row.isProfit || row.isMargin) ? `${colors.background}` : idx % 2 === 0 ? `${colors.background}80` : 'transparent',
                  fontWeight: (row.isProfit || row.isMargin) ? 600 : 400,
                }}
              >
                <td className="py-2 px-3" style={{ color: colors.text }}>{row.label}</td>
                <td
                  className="py-2 px-3 text-right"
                  style={{
                    color: row.isProfit
                      ? forecast_data.conservative.netProfit > 0 ? '#34d399' : '#f87171'
                      : colors.text,
                  }}
                >
                  {row.isMargin
                    ? `${forecast_data.conservative[row.key]?.toFixed(1) || '0'}%`
                    : formatCurrency(forecast_data.conservative[row.key] || 0)}
                </td>
                <td
                  className="py-2 px-3 text-right"
                  style={{
                    color: row.isProfit
                      ? forecast_data.expected.netProfit > 0 ? '#34d399' : '#f87171'
                      : colors.text,
                  }}
                >
                  {row.isMargin
                    ? `${forecast_data.expected[row.key]?.toFixed(1) || '0'}%`
                    : formatCurrency(forecast_data.expected[row.key] || 0)}
                </td>
                <td
                  className="py-2 px-3 text-right"
                  style={{
                    color: row.isProfit
                      ? forecast_data.optimistic.netProfit > 0 ? '#34d399' : '#f87171'
                      : colors.text,
                  }}
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
      <div className="pt-6 flex-1" style={{ borderTop: `1px solid ${colors.border}` }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: colors.text }}>Cumulative Cash Flow (60 days)</h4>
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
                <CartesianGrid strokeDasharray="3 3" stroke={colors.chartGrid || colors.border} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  stroke={colors.border}
                />
                <YAxis
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  tickFormatter={(value) => `$${Math.round(value / 1000)}K`}
                  stroke={colors.border}
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
            <div className="flex items-center justify-center h-full" style={{ color: colors.textSecondary }}>
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
