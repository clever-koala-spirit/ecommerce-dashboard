import React, { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { formatCurrency, formatNumber, formatPercent, filterDataByDateRange } from '../../utils/formatters';
import { CHANNEL_COLORS } from '../../utils/colors';
import EmptyState from '../common/EmptyState';

export default function ChannelPerformanceTable() {
  const dateRange = useStore((state) => state.dateRange);
  const shopifyData = useStore((state) => state.shopifyData);
  const metaData = useStore((state) => state.metaData);
  const googleData = useStore((state) => state.googleData);
  const ga4Data = useStore((state) => state.ga4Data);
  const [sortConfig, setSortConfig] = useState({ key: 'revenue', direction: 'desc' });

  const channelData = useMemo(() => {
    const filteredShopify = filterDataByDateRange(shopifyData || [], dateRange);
    const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
    const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);
    const filteredGA4 = filterDataByDateRange(ga4Data || [], dateRange);

    const shopifyTotal = filteredShopify.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const metaSpend = filteredMeta.reduce((sum, d) => sum + (d.spend || 0), 0);
    const metaRevenue = filteredMeta.reduce((sum, d) => sum + (d.revenue || 0), 0);
    const googleSpend = filteredGoogle.reduce((sum, d) => sum + (d.spend || 0), 0);
    const googleRevenue = filteredGoogle.reduce((sum, d) => sum + (d.conversionValue || 0), 0);

    const channels = [
      {
        name: 'Meta Ads',
        spend: metaSpend,
        revenue: metaRevenue,
        orders: filteredMeta.reduce((sum, d) => sum + (d.purchases || 0), 0),
        cpa: metaSpend > 0 ? metaSpend / Math.max(1, filteredMeta.reduce((sum, d) => sum + (d.purchases || 0), 0)) : 0,
      },
      {
        name: 'Google Ads',
        spend: googleSpend,
        revenue: googleRevenue,
        orders: filteredGoogle.reduce((sum, d) => sum + (d.conversions || 0), 0),
        cpa: googleSpend > 0 ? googleSpend / Math.max(1, filteredGoogle.reduce((sum, d) => sum + (d.conversions || 0), 0)) : 0,
      },
      {
        name: 'Klaviyo Email',
        spend: 0,
        revenue: 0, // Only real data when Klaviyo connected
        orders: 0,
        cpa: 0,
      },
      {
        name: 'Organic',
        spend: 0,
        revenue: filteredGA4.reduce((sum, d) => sum + ((d.organicSessions / Math.max(1, d.sessions)) * d.revenue || 0), 0),
        orders: 0,
        cpa: 0,
      },
      {
        name: 'Direct',
        spend: 0,
        revenue: filteredGA4.reduce((sum, d) => sum + ((d.directSessions / Math.max(1, d.sessions)) * d.revenue || 0), 0),
        orders: 0,
        cpa: 0,
      },
      {
        name: 'Social',
        spend: 0,
        revenue: filteredGA4.reduce((sum, d) => sum + ((d.socialSessions / Math.max(1, d.sessions)) * d.revenue || 0), 0),
        orders: 0,
        cpa: 0,
      },
      {
        name: 'Referral',
        spend: 0,
        revenue: filteredGA4.reduce((sum, d) => sum + ((d.referralSessions / Math.max(1, d.sessions)) * d.revenue || 0), 0),
        orders: 0,
        cpa: 0,
      },
    ];

    // Calculate totals
    const totalSpend = channels.reduce((sum, c) => sum + c.spend, 0);
    const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0);
    const totalOrders = channels.reduce((sum, c) => sum + c.orders, 0);

    // Add metrics
    const channelsWithMetrics = channels.map((channel) => ({
      ...channel,
      roas: channel.spend > 0 ? channel.revenue / channel.spend : 0,
      percentOfRevenue: totalRevenue > 0 ? (channel.revenue / totalRevenue) * 100 : 0,
      profitContribution: 0, // Only real profit data
    }));

    // Add totals row
    channelsWithMetrics.push({
      name: 'TOTAL',
      spend: totalSpend,
      revenue: totalRevenue,
      orders: totalOrders,
      roas: totalSpend > 0 ? totalRevenue / totalSpend : 0,
      cpa: totalOrders > 0 ? totalSpend / totalOrders : 0,
      percentOfRevenue: 100,
      profitContribution: 0, // Only real data
      isTotal: true,
    });

    return channelsWithMetrics;
  }, [dateRange, shopifyData, metaData, googleData, ga4Data]);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    const dataWithoutTotal = channelData.slice(0, -1);
    const total = channelData[channelData.length - 1];

    const sorted = [...dataWithoutTotal].sort((a, b) => {
      const aVal = a[sortConfig.key] || 0;
      const bVal = b[sortConfig.key] || 0;
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return [...sorted, total];
  }, [channelData, sortConfig]);

  const SortHeader = ({ label, sortKey, onClick }) => (
    <th
      className="px-4 py-3 text-left cursor-pointer hover:bg-opacity-50 transition-colors"
      style={{ color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-bg-card)' }}
      onClick={() => onClick(sortKey)}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {sortConfig.key === sortKey && (
          <span className="text-xs">
            {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </th>
  );

  const getChannelColor = (channelName) => {
    const map = {
      'Meta Ads': '#1877F2',
      'Google Ads': '#EA4335',
      'Klaviyo Email': '#2D2D2D',
      Organic: '#22c55e',
      Direct: '#a855f7',
      Social: '#ec4899',
      Referral: '#f97316',
    };
    return map[channelName] || '#6b7280';
  };

  const exportToCSV = () => {
    const headers = ['Channel', 'Spend', 'Revenue', 'ROAS', 'CPA', 'Orders', '% of Revenue', 'Profit Contribution'];
    const rows = sortedData.map((row) => [
      row.name,
      row.spend.toFixed(2),
      row.revenue.toFixed(2),
      row.roas.toFixed(2),
      row.cpa.toFixed(2),
      row.orders,
      row.percentOfRevenue.toFixed(1),
      row.profitContribution.toFixed(2),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `channel-performance-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!sortedData || sortedData.length === 0) {
    return (
      <div
        className="glass-card p-5"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        <h3 style={{ color: 'var(--color-text-primary)' }} className="font-semibold mb-4">
          Channel Performance
        </h3>
        <EmptyState icon="chart" title="No channel data" message="No performance data found for this period. Try a different date range." />
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
          Channel Performance
        </h3>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 rounded text-sm font-medium transition-colors"
          style={{
            backgroundColor: 'var(--color-bg-hover)',
            color: 'var(--color-text-primary)',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--color-border)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'var(--color-bg-hover)';
          }}
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              <th
                className="px-4 py-3 text-left"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Channel
              </th>
              <SortHeader
                label="Spend"
                sortKey="spend"
                onClick={handleSort}
              />
              <SortHeader
                label="Revenue"
                sortKey="revenue"
                onClick={handleSort}
              />
              <SortHeader
                label="ROAS"
                sortKey="roas"
                onClick={handleSort}
              />
              <SortHeader
                label="CPA"
                sortKey="cpa"
                onClick={handleSort}
              />
              <SortHeader
                label="Orders"
                sortKey="orders"
                onClick={handleSort}
              />
              <SortHeader
                label="% of Revenue"
                sortKey="percentOfRevenue"
                onClick={handleSort}
              />
              <SortHeader
                label="Profit Contribution"
                sortKey="profitContribution"
                onClick={handleSort}
              />
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => {
              const isBestSpend = idx < sortedData.length - 1 && row.spend === Math.max(...sortedData.slice(0, -1).map((r) => r.spend));
              const isBestRevenue = idx < sortedData.length - 1 && row.revenue === Math.max(...sortedData.slice(0, -1).map((r) => r.revenue));
              const isBestROAS = idx < sortedData.length - 1 && row.roas === Math.max(...sortedData.slice(0, -1).map((r) => r.roas));

              return (
                <tr
                  key={row.name}
                  style={{
                    backgroundColor: row.isTotal
                      ? 'var(--color-bg-hover)'
                      : idx % 2 === 0
                        ? 'transparent'
                        : 'var(--color-bg-alt-row, rgba(0,0,0,0.02))',
                    borderBottom: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!row.isTotal) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = row.isTotal
                      ? 'var(--color-bg-hover)'
                      : idx % 2 === 0
                        ? 'transparent'
                        : 'var(--color-bg-alt-row, rgba(0,0,0,0.02))';
                  }}
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    {!row.isTotal && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: getChannelColor(row.name),
                        }}
                      />
                    )}
                    <span className={row.isTotal ? 'font-semibold' : ''}>
                      {row.name}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 ${isBestSpend && !row.isTotal ? 'font-semibold' : ''}`}
                  >
                    {formatCurrency(row.spend)}
                  </td>
                  <td
                    className={`px-4 py-3 ${isBestRevenue && !row.isTotal ? 'font-semibold' : ''}`}
                  >
                    {formatCurrency(row.revenue)}
                  </td>
                  <td
                    className={`px-4 py-3 ${isBestROAS && !row.isTotal ? 'font-semibold' : ''}`}
                  >
                    {row.roas.toFixed(2)}x
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(row.cpa)}
                  </td>
                  <td className="px-4 py-3">
                    {formatNumber(row.orders)}
                  </td>
                  <td className="px-4 py-3">
                    {row.percentOfRevenue.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(row.profitContribution)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
