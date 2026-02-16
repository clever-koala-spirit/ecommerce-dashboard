import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { formatCurrency, filterDataByDateRange, formatDateShort } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import EmptyState from '../common/EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 rounded border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <p className="font-semibold mb-1">{label}</p>
        {payload
          .sort((a, b) => b.value - a.value)
          .map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        <p className="font-semibold mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Total: {formatCurrency(payload.reduce((sum, p) => sum + p.value, 0))}
        </p>
      </div>
    );
  }
  return null;
};

const PieCustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="p-3 rounded border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <p className="font-semibold">{data.name}</p>
        <p>{formatCurrency(data.value)}</p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {data.percent.toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export default function CostBreakdownChart() {
  const dateRange = useStore((state) => state.dateRange);
  const shopifyData = useStore((state) => state.shopifyData);
  const metaData = useStore((state) => state.metaData);
  const googleData = useStore((state) => state.googleData);

  const { areaChartData, pieChartData, totalCosts } = useMemo(() => {
    const filteredShopify = filterDataByDateRange(shopifyData || [], dateRange);
    const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
    const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);

    // Prepare area chart data (daily costs)
    const areaData = filteredShopify.map((shopifyItem) => {
      const metaItem = filteredMeta.find((d) => d.date === shopifyItem.date);
      const googleItem = filteredGoogle.find((d) => d.date === shopifyItem.date);

      return {
        date: formatDateShort(shopifyItem.date),
        adSpend: (metaItem?.spend || 0) + (googleItem?.spend || 0),
        cogs: shopifyItem.cogs || 0,
        shipping: shopifyItem.shipping || 0,
        platformFees: shopifyItem.transactionFees || 0,
        otherCosts: 0, // Only real costs
      };
    });

    // Calculate total costs for pie chart
    const totalAdSpend = areaData.reduce((sum, d) => sum + d.adSpend, 0);
    const totalCogs = areaData.reduce((sum, d) => sum + d.cogs, 0);
    const totalShipping = areaData.reduce((sum, d) => sum + d.shipping, 0);
    const totalPlatformFees = areaData.reduce((sum, d) => sum + d.platformFees, 0);
    const totalOtherCosts = areaData.reduce((sum, d) => sum + d.otherCosts, 0);
    const grandTotal = totalAdSpend + totalCogs + totalShipping + totalPlatformFees + totalOtherCosts;

    const pieData = [
      { name: 'Ad Spend', value: totalAdSpend, percent: (totalAdSpend / grandTotal) * 100, fill: COLORS.ORANGE[500] },
      { name: 'COGS', value: totalCogs, percent: (totalCogs / grandTotal) * 100, fill: COLORS.RED[500] },
      { name: 'Shipping', value: totalShipping, percent: (totalShipping / grandTotal) * 100, fill: COLORS.BLUE[500] },
      { name: 'Platform Fees', value: totalPlatformFees, percent: (totalPlatformFees / grandTotal) * 100, fill: COLORS.GRAY[500] },
      { name: 'Other Costs', value: totalOtherCosts, percent: (totalOtherCosts / grandTotal) * 100, fill: COLORS.PURPLE[500] },
    ].filter((item) => item.value > 0);

    return {
      areaChartData: areaData,
      pieChartData: pieData,
      totalCosts: grandTotal,
    };
  }, [dateRange]);

  if (!areaChartData || areaChartData.length === 0) {
    return (
      <div
        className="glass-card p-5"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
          Cost Breakdown
        </h3>
        <EmptyState icon="money" title="No cost data" message="No cost data found for this period. Connect platforms and add COGS to track costs." />
      </div>
    );
  }

  return (
    <div
      className="glass-card p-5 animate-fadeIn"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
        Cost Breakdown
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Stacked Area Chart */}
        <div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaChartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.ORANGE[500]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.ORANGE[500]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.RED[500]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.RED[500]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorShipping" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.BLUE[500]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.BLUE[500]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPlatformFees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.GRAY[500]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.GRAY[500]} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOtherCosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.PURPLE[500]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.PURPLE[500]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value, 0)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(_, entry) => (
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {entry.dataKey === 'adSpend'
                      ? 'Ad Spend'
                      : entry.dataKey === 'cogs'
                        ? 'COGS'
                        : entry.dataKey === 'shipping'
                          ? 'Shipping'
                          : entry.dataKey === 'platformFees'
                            ? 'Platform Fees'
                            : 'Other Costs'}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey="adSpend"
                stackId="1"
                stroke={COLORS.ORANGE[500]}
                fill="url(#colorAdSpend)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="cogs"
                stackId="1"
                stroke={COLORS.RED[500]}
                fill="url(#colorCogs)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="shipping"
                stackId="1"
                stroke={COLORS.BLUE[500]}
                fill="url(#colorShipping)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="platformFees"
                stackId="1"
                stroke={COLORS.GRAY[500]}
                fill="url(#colorPlatformFees)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="otherCosts"
                stackId="1"
                stroke={COLORS.PURPLE[500]}
                fill="url(#colorOtherCosts)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Right: Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${entry.percent.toFixed(0)}%`}
                labelLine={false}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieCustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 text-center">
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-sm mb-1">
              Total Costs
            </p>
            <p style={{ color: 'var(--color-text-primary)' }} className="text-xl font-bold">
              {formatCurrency(totalCosts)}
            </p>
          </div>
        </div>
      </div>

      {/* Legend for pie chart */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        {pieChartData.map((item) => (
          <div key={item.name} className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '2px',
                  backgroundColor: item.fill,
                }}
              />
              <span style={{ color: 'var(--color-text-secondary)' }}>{item.name}</span>
            </div>
            <p style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
              {formatCurrency(item.value)}
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }} className="text-xs">
              {item.percent.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
