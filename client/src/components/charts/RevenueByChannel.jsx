import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { mockData } from '../../mock/mockData';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatPercent, filterDataByDateRange } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

const CustomTooltip = ({ active, payload }) => {
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

export default function RevenueByChannel() {
  const dateRange = useStore((state) => state.dateRange);

  const chartData = useMemo(() => {
    const filteredShopify = filterDataByDateRange(mockData.shopify, dateRange);
    const filteredMeta = filterDataByDateRange(mockData.meta, dateRange);
    const filteredGoogle = filterDataByDateRange(mockData.google, dateRange);
    const filteredGA4 = filterDataByDateRange(mockData.ga4, dateRange);

    const metaRevenue = filteredMeta.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const googleRevenue = filteredGoogle.reduce((sum, d) => sum + (d.conversionValue || 0), 0);
    const organicRevenue = filteredGA4.reduce(
      (sum, d) => sum + ((d.organicSessions / Math.max(1, d.sessions)) * d.revenue || 0),
      0
    );
    const directRevenue = filteredGA4.reduce(
      (sum, d) => sum + ((d.directSessions / Math.max(1, d.sessions)) * d.revenue || 0),
      0
    );
    const socialRevenue = filteredGA4.reduce(
      (sum, d) => sum + ((d.socialSessions / Math.max(1, d.sessions)) * d.revenue || 0),
      0
    );
    const referralRevenue = filteredGA4.reduce(
      (sum, d) => sum + ((d.referralSessions / Math.max(1, d.sessions)) * d.revenue || 0),
      0
    );
    const klaviyoRevenue = filteredShopify.reduce((sum, d) => sum + (d.revenue * 0.18 || 0), 0);

    const channels = [
      { name: 'Meta Ads', value: metaRevenue, fill: '#1877F2' },
      { name: 'Google Ads', value: googleRevenue, fill: '#EA4335' },
      { name: 'Klaviyo Email', value: klaviyoRevenue, fill: COLORS.CYAN[500] },
      { name: 'Organic', value: organicRevenue, fill: COLORS.GREEN[500] },
      { name: 'Direct', value: directRevenue, fill: COLORS.PURPLE[500] },
      { name: 'Social', value: socialRevenue, fill: COLORS.PINK[500] },
      { name: 'Referral', value: referralRevenue, fill: COLORS.ORANGE[500] },
    ];

    const totalRevenue = channels.reduce((sum, c) => sum + c.value, 0);

    return {
      channels: channels.filter((c) => c.value > 0),
      totalRevenue,
    };
  }, [dateRange]);

  if (chartData.channels.length === 0 || chartData.totalRevenue === 0) {
    return (
      <div
        className="glass-card p-5"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
          Revenue by Channel
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            No data available for the selected period
          </p>
        </div>
      </div>
    );
  }

  const chartDataWithPercent = chartData.channels.map((c) => ({
    ...c,
    percent: (c.value / chartData.totalRevenue) * 100,
  }));

  return (
    <div
      className="glass-card p-5"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
        Revenue by Channel
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartDataWithPercent}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={(entry) => `${entry.percent.toFixed(0)}%`}
            labelLine={false}
          >
            {chartDataWithPercent.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(_, entry) => (
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {entry.payload.name}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
        <div className="text-center">
          <p
            style={{ color: 'var(--color-text-secondary)' }}
            className="text-sm mb-1"
          >
            Total Revenue
          </p>
          <p
            style={{ color: 'var(--color-text-primary)' }}
            className="text-2xl font-bold"
          >
            {formatCurrency(chartData.totalRevenue)}
          </p>
        </div>
      </div>
    </div>
  );
}
