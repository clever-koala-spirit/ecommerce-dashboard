import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { formatCurrency, filterDataByDateRange, formatDateShort } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';
import EmptyState from '../common/EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find((p) => p.dataKey === 'revenue')?.value || 0;
    const spend = payload.find((p) => p.dataKey === 'spend')?.value || 0;
    const roas = spend > 0 ? revenue / spend : 0;

    return (
      <div
        className="chart-tooltip p-3 rounded-xl"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)',
        }}
      >
        <p className="font-semibold mb-1">{label}</p>
        <p style={{ color: COLORS.BLUE[500] }}>
          Revenue: {formatCurrency(revenue)}
        </p>
        <p style={{ color: COLORS.ORANGE[500] }}>
          Spend: {formatCurrency(spend)}
        </p>
        <p style={{ color: COLORS.GREEN[500] }} className="font-semibold">
          ROAS: {roas.toFixed(2)}x
        </p>
      </div>
    );
  }
  return null;
};

export default function PaidAdsChart() {
  const dateRange = useStore((state) => state.dateRange);
  const metaData = useStore((state) => state.metaData);
  const googleData = useStore((state) => state.googleData);
  const [platform, setPlatform] = useState('all');

  const chartData = useMemo(() => {
    const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
    const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);

    let data = [];

    if (platform === 'all' || platform === 'meta') {
      data = filteredMeta.map((d) => ({
        date: d.date,
        metaRevenue: d.revenue || 0,
        metaSpend: d.spend || 0,
      }));
    }

    if (platform === 'all' || platform === 'google') {
      if (platform === 'all') {
        data = data.map((item) => {
          const googleDate = filteredGoogle.find((d) => d.date === item.date);
          return {
            ...item,
            googleRevenue: googleDate?.conversionValue || 0,
            googleSpend: googleDate?.spend || 0,
          };
        });
      } else {
        data = filteredGoogle.map((d) => ({
          date: d.date,
          googleRevenue: d.conversionValue || 0,
          googleSpend: d.spend || 0,
        }));
      }
    }

    // Combine to total revenue and spend
    return data.map((d) => {
      const revenue = (d.metaRevenue || 0) + (d.googleRevenue || 0);
      const spend = (d.metaSpend || 0) + (d.googleSpend || 0);
      return {
        date: formatDateShort(d.date),
        revenue,
        spend,
      };
    });
  }, [dateRange, platform]);

  if (chartData.length === 0) {
    return (
      <div
        className="glass-card p-5"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
            Paid Ads Performance
          </h3>
        </div>
        <EmptyState icon="trend" title="No ad data available" message="Connect Meta or Google Ads in Settings to see ad performance." />
      </div>
    );
  }

  return (
    <div
      className="glass-card p-5 animate-fadeIn"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold">
          Paid Ads Performance
        </h3>
        <div className="flex gap-2">
          {['all', 'meta', 'google'].map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className="px-3 py-1 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: platform === p ? 'var(--color-border)' : 'transparent',
                color: 'var(--color-text-primary)',
                border: `1px solid ${platform === p ? 'var(--color-border)' : 'transparent'}`,
              }}
            >
              {p === 'all' ? 'All Paid' : p === 'meta' ? 'Meta' : 'Google'}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.BLUE[500]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.BLUE[500]} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.ORANGE[500]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.ORANGE[500]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-chart-grid)" strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value, 0)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
            tickFormatter={(value) => formatCurrency(value, 0)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(_, entry) => (
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {entry.dataKey === 'revenue' ? 'Revenue' : 'Spend'}
              </span>
            )}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            fill="url(#colorRevenue)"
            stroke={COLORS.BLUE[500]}
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="spend"
            fill="url(#colorSpend)"
            stroke={COLORS.ORANGE[500]}
            strokeWidth={2}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
