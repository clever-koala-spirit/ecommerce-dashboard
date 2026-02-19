import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/common/SEO';
import { useStore } from '../store/useStore';

export default function OrdersPage() {
  const { colors } = useTheme();
  const shopifyData = useStore(s => s.shopifyData);
  const fetchDashboardData = useStore(s => s.fetchDashboardData);
  const loading = useStore(s => s.isLoading?.shopify);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!shopifyData?.length) fetchDashboardData();
  }, []);

  // Flatten orders from daily data
  const orders = (shopifyData || []).flatMap(day => {
    if (day.orderDetails?.length) return day.orderDetails;
    // If no order details, create a summary row per day
    return day.orders > 0 ? [{
      id: day.date,
      date: day.date,
      customer: `${day.orders} orders`,
      revenue: day.revenue || day.grossRevenue || 0,
      items: day.orders,
      status: 'paid',
      isSummary: true,
    }] : [];
  });

  const sorted = [...orders].sort((a, b) => {
    if (sortField === 'date') return sortDir === 'desc' ? b.date?.localeCompare(a.date) : a.date?.localeCompare(b.date);
    if (sortField === 'revenue') return sortDir === 'desc' ? (b.revenue || 0) - (a.revenue || 0) : (a.revenue || 0) - (b.revenue || 0);
    return 0;
  });

  const filtered = search
    ? sorted.filter(o => o.customer?.toLowerCase().includes(search.toLowerCase()) || o.id?.toString().includes(search))
    : sorted;

  const totalRevenue = orders.reduce((s, o) => s + (o.revenue || 0), 0);
  const totalOrders = orders.reduce((s, o) => s + (o.isSummary ? o.items : 1), 0);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <>
      <SEO title="Orders — Slay Season" />
      <div style={{ padding: '32px', maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>Orders</h1>
          <input
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: `1px solid ${colors.border}`,
              background: colors.surface, color: colors.text, width: 260, fontSize: 14
            }}
          />
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Orders', value: totalOrders.toLocaleString() },
            { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
            { label: 'Avg Order Value', value: totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : '—' },
          ].map(card => (
            <div key={card.label} style={{
              background: colors.surface, borderRadius: 12, padding: '20px 24px',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: colors.text }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Orders table */}
        <div style={{
          background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>No orders found</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {['Date', 'Order', 'Customer', 'Items', 'Revenue', 'Status'].map(h => (
                    <th key={h} onClick={() => h === 'Date' ? toggleSort('date') : h === 'Revenue' ? toggleSort('revenue') : null}
                      style={{
                        padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                        color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em',
                        cursor: (h === 'Date' || h === 'Revenue') ? 'pointer' : 'default',
                        userSelect: 'none'
                      }}>
                      {h} {sortField === h.toLowerCase() && (sortDir === 'desc' ? '↓' : '↑')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <tr key={order.id || i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: colors.text }}>{order.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: colors.accent }}>
                      {order.isSummary ? 'Daily Summary' : `#${order.id?.toString().slice(-6) || '—'}`}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: colors.text }}>{order.customer || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: colors.text }}>{order.items || 1}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: colors.text }}>
                      ${(order.revenue || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                        background: order.status === 'paid' ? '#dcfce7' : order.status === 'refunded' ? '#fef2f2' : '#f3f4f6',
                        color: order.status === 'paid' ? '#166534' : order.status === 'refunded' ? '#991b1b' : '#4b5563'
                      }}>
                        {order.status || 'paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
