import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { formatCurrency } from '../../utils/formatters';
import { filterDataByDateRange } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import EmptyState from '../common/EmptyState';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const amount = data.amount || 0;
    const percentOfGross = data.percentOfGross || 0;

    return (
      <div
        className="chart-tooltip p-3 rounded-xl"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p className="font-semibold">{data.name}</p>
        <p>{formatCurrency(Math.abs(amount))}</p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {percentOfGross.toFixed(1)}% of Gross Revenue
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueWaterfall() {
  const dateRange = useStore((state) => state.dateRange);
  const shopifyData = useStore((state) => state.shopifyData);
  const metaData = useStore((state) => state.metaData);
  const googleData = useStore((state) => state.googleData);

  const chartData = useMemo(() => {
    const filteredShopify = filterDataByDateRange(shopifyData || [], dateRange);
    const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
    const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);

    const grossRevenue = filteredShopify.reduce((sum, d) => sum + (d.grossRevenue || d.revenue || 0), 0);
    const refunds = filteredShopify.reduce((sum, d) => sum + (d.refundAmount || 0), 0);
    const cogs = filteredShopify.reduce((sum, d) => sum + (d.cogs || 0), 0);
    const shipping = filteredShopify.reduce((sum, d) => sum + (d.shipping || 0), 0);
    const transactionFees = filteredShopify.reduce(
      (sum, d) => sum + (d.transactionFees || 0),
      0
    );
    const adSpend =
      filteredMeta.reduce((sum, d) => sum + (d.spend || 0), 0) +
      filteredGoogle.reduce((sum, d) => sum + (d.spend || 0), 0);

    // Estimate other costs at 2% of revenue
    const otherCosts = 0; // No estimated costs - only real data

    const netProfit =
      grossRevenue - refunds - cogs - shipping - transactionFees - adSpend - otherCosts;

    const data = [
      {
        name: 'Gross Revenue',
        amount: grossRevenue,
        fill: COLORS.BLUE[500],
        percentOfGross: 100,
      },
      {
        name: 'Refunds',
        amount: -refunds,
        fill: COLORS.RED[500],
        percentOfGross: (refunds / grossRevenue) * 100,
      },
      {
        name: 'COGS',
        amount: -cogs,
        fill: COLORS.RED[500],
        percentOfGross: (cogs / grossRevenue) * 100,
      },
      {
        name: 'Ad Spend',
        amount: -adSpend,
        fill: COLORS.ORANGE[500],
        percentOfGross: (adSpend / grossRevenue) * 100,
      },
      {
        name: 'Platform Fees',
        amount: -transactionFees,
        fill: COLORS.RED[500],
        percentOfGross: (transactionFees / grossRevenue) * 100,
      },
      {
        name: 'Shipping',
        amount: -shipping,
        fill: COLORS.RED[500],
        percentOfGross: (shipping / grossRevenue) * 100,
      },
      {
        name: 'Other Costs',
        amount: -otherCosts,
        fill: COLORS.RED[500],
        percentOfGross: (otherCosts / grossRevenue) * 100,
      },
      {
        name: 'Net Profit',
        amount: netProfit,
        fill: netProfit >= 0 ? COLORS.GREEN[500] : COLORS.RED[500],
        percentOfGross: (netProfit / grossRevenue) * 100,
      },
    ];

    return data;
  }, [dateRange, shopifyData, metaData, googleData]);

  // Custom render to create waterfall effect
  const CustomBar = (props) => {
    const { x, y, width, height, payload, fill } = props;
    if (!payload || height === undefined) return null;

    return (
      <g>
        <rect x={x} y={y} width={width} height={Math.abs(height)} fill={fill} />
        <text
          x={x + width / 2}
          y={y - 5}
          textAnchor="middle"
          fontSize={12}
          fontWeight="600"
          fill="var(--color-text-primary)"
        >
          {formatCurrency(Math.abs(payload.amount))}
        </text>
      </g>
    );
  };

  if (chartData.length === 0 || !chartData[0].amount) {
    return (
      <div
        className="glass-card p-5"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
          Revenue Waterfall
        </h3>
        <EmptyState icon="chart" title="No revenue data" message="No orders found in this period. Try selecting a different date range." />
      </div>
    );
  }

  return (
    <div
      className="glass-card p-5 animate-fadeIn"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
        Revenue Waterfall
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-chart-grid)"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value, 0)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="amount"
            shape={<CustomBar />}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
