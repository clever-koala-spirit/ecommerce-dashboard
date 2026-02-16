import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { formatCurrency, filterDataByDateRange, formatDateShort } from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const flowRevenue = payload.find((p) => p.dataKey === 'flowRevenue')?.value || 0;
    const campaignRevenue = payload.find((p) => p.dataKey === 'campaignRevenue')?.value || 0;

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
        <p style={{ color: COLORS.CYAN[500] }}>
          Flow Revenue: {formatCurrency(flowRevenue)}
        </p>
        <p style={{ color: COLORS.PURPLE[500] }}>
          Campaign Revenue: {formatCurrency(campaignRevenue)}
        </p>
        <p style={{ color: 'var(--color-text-secondary)' }} className="font-semibold mt-1">
          Total: {formatCurrency(flowRevenue + campaignRevenue)}
        </p>
      </div>
    );
  }
  return null;
};

export default function KlaviyoChart() {
  const dateRange = useStore((state) => state.dateRange);
  const klaviyoData = useStore((state) => state.klaviyoData);

  const { chartData, flowStats } = useMemo(() => {
    const filteredKlaviyo = filterDataByDateRange(klaviyoData || [], dateRange);
    const filteredFlows = [];

    const data = filteredKlaviyo.map((d) => ({
      date: formatDateShort(d.date),
      flowRevenue: d.flowRevenue || 0,
      campaignRevenue: d.campaignRevenue || 0,
    }));

    // Calculate flow stats
    const stats = [
      {
        name: 'Welcome Series',
        type: 'welcome',
        revenue: filteredFlows.find((f) => f.type === 'welcome')?.revenue || 0,
        sent: filteredFlows.find((f) => f.type === 'welcome')?.sent || 0,
        opened: filteredFlows.find((f) => f.type === 'welcome')?.opened || 0,
        clicked: filteredFlows.find((f) => f.type === 'welcome')?.clicked || 0,
        converted: filteredFlows.find((f) => f.type === 'welcome')?.converted || 0,
      },
      {
        name: 'Abandoned Cart',
        type: 'abandoned_cart',
        revenue: filteredFlows
          .filter((f) => f.type === 'abandoned_cart')
          .reduce((sum, f) => sum + f.revenue, 0),
        sent: filteredFlows
          .filter((f) => f.type === 'abandoned_cart')
          .reduce((sum, f) => sum + f.sent, 0),
        opened: filteredFlows
          .filter((f) => f.type === 'abandoned_cart')
          .reduce((sum, f) => sum + f.opened, 0),
        clicked: filteredFlows
          .filter((f) => f.type === 'abandoned_cart')
          .reduce((sum, f) => sum + f.clicked, 0),
        converted: filteredFlows
          .filter((f) => f.type === 'abandoned_cart')
          .reduce((sum, f) => sum + f.converted, 0),
      },
      {
        name: 'Post-Purchase',
        type: 'post_purchase',
        revenue: filteredFlows
          .filter((f) => f.type === 'post_purchase')
          .reduce((sum, f) => sum + f.revenue, 0),
        sent: filteredFlows
          .filter((f) => f.type === 'post_purchase')
          .reduce((sum, f) => sum + f.sent, 0),
        opened: filteredFlows
          .filter((f) => f.type === 'post_purchase')
          .reduce((sum, f) => sum + f.opened, 0),
        clicked: filteredFlows
          .filter((f) => f.type === 'post_purchase')
          .reduce((sum, f) => sum + f.clicked, 0),
        converted: filteredFlows
          .filter((f) => f.type === 'post_purchase')
          .reduce((sum, f) => sum + f.converted, 0),
      },
      {
        name: 'Win-back',
        type: 'winback',
        revenue: filteredFlows.find((f) => f.type === 'winback')?.revenue || 0,
        sent: filteredFlows.find((f) => f.type === 'winback')?.sent || 0,
        opened: filteredFlows.find((f) => f.type === 'winback')?.opened || 0,
        clicked: filteredFlows.find((f) => f.type === 'winback')?.clicked || 0,
        converted: filteredFlows.find((f) => f.type === 'winback')?.converted || 0,
      },
    ].map((flow) => ({
      ...flow,
      openRate: flow.sent > 0 ? ((flow.opened / flow.sent) * 100).toFixed(1) : 0,
      clickRate: flow.opened > 0 ? ((flow.clicked / flow.opened) * 100).toFixed(1) : 0,
      conversionRate:
        flow.clicked > 0 ? ((flow.converted / flow.clicked) * 100).toFixed(1) : 0,
      revenuePerEmail: flow.sent > 0 ? (flow.revenue / flow.sent).toFixed(2) : 0,
    }));

    return { chartData: data, flowStats: stats };
  }, [dateRange]);

  if (chartData.length === 0) {
    return (
      <div
        className="glass-card p-5"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
          Email Performance
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Connect Klaviyo in Settings to see email performance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-card p-5"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
        Email Performance
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(_, entry) => (
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {entry.dataKey === 'flowRevenue' ? 'Flow Revenue' : 'Campaign Revenue'}
              </span>
            )}
          />
          <Bar
            dataKey="flowRevenue"
            stackId="revenue"
            fill={COLORS.CYAN[500]}
            isAnimationActive={false}
          />
          <Bar
            dataKey="campaignRevenue"
            stackId="revenue"
            fill={COLORS.PURPLE[500]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
        <h4
          style={{ color: 'var(--color-text-primary)' }}
          className="font-semibold mb-4"
        >
          Flow Performance
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th
                  className="px-4 py-2 text-left"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Flow
                </th>
                <th
                  className="px-4 py-2 text-right"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Revenue
                </th>
                <th
                  className="px-4 py-2 text-right"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Sent
                </th>
                <th
                  className="px-4 py-2 text-right"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Open Rate
                </th>
                <th
                  className="px-4 py-2 text-right"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Click Rate
                </th>
                <th
                  className="px-4 py-2 text-right"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Rev/Email
                </th>
              </tr>
            </thead>
            <tbody>
              {flowStats.map((flow, idx) => (
                <tr
                  key={flow.name}
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor:
                            flow.type === 'welcome'
                              ? COLORS.CYAN[500]
                              : flow.type === 'abandoned_cart'
                                ? COLORS.ORANGE[500]
                                : flow.type === 'post_purchase'
                                  ? COLORS.PURPLE[500]
                                  : COLORS.PINK[500],
                        }}
                      />
                      <span>{flow.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(flow.revenue)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {flow.sent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {flow.openRate}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    {flow.clickRate}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatCurrency(parseFloat(flow.revenuePerEmail))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
