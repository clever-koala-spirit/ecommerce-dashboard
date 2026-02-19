import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/common/SEO';
import { useStore } from '../store/useStore';

export default function ProductsPage() {
  const { colors } = useTheme();
  const shopifyData = useStore(s => s.shopifyData);
  const fetchDashboardData = useStore(s => s.fetchDashboardData);
  const loading = useStore(s => s.isLoading?.shopify);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!shopifyData?.length) fetchDashboardData();
  }, []);

  // Extract product data from shopify daily data
  const productMap = {};
  (shopifyData || []).forEach(day => {
    if (day.productBreakdown) {
      day.productBreakdown.forEach(p => {
        const key = p.title || p.name || 'Unknown';
        if (!productMap[key]) productMap[key] = { name: key, sold: 0, revenue: 0, cogs: 0 };
        productMap[key].sold += p.quantity || 0;
        productMap[key].revenue += p.revenue || 0;
        productMap[key].cogs += p.cogs || 0;
      });
    }
  });

  let products = Object.values(productMap).sort((a, b) => b.revenue - a.revenue);

  // If no product breakdown available, show summary
  if (products.length === 0) {
    const totalSold = (shopifyData || []).reduce((s, d) => s + (d.orders || 0), 0);
    const totalRev = (shopifyData || []).reduce((s, d) => s + (d.revenue || d.grossRevenue || 0), 0);
    const totalCogs = (shopifyData || []).reduce((s, d) => s + (d.cogs || 0), 0);
    products = [{ name: 'All Products (summary)', sold: totalSold, revenue: totalRev, cogs: totalCogs }];
  }

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const totalSold = products.reduce((s, p) => s + p.sold, 0);

  return (
    <>
      <SEO title="Products — Slay Season" />
      <div style={{ padding: '32px', maxWidth: 1200 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text }}>Products</h1>
          <input
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 16px', borderRadius: 8, border: `1px solid ${colors.border}`,
              background: colors.surface, color: colors.text, width: 260, fontSize: 14
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Products', value: products.length.toLocaleString() },
            { label: 'Total Sold', value: totalSold.toLocaleString() },
            { label: 'Product Revenue', value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
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

        <div style={{ background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>Loading products...</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {['Product', 'Sold', 'Revenue', 'COGS', 'Margin', '% of Revenue'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                      color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const margin = p.revenue - p.cogs;
                  const marginPct = p.revenue > 0 ? ((margin / p.revenue) * 100).toFixed(1) : '—';
                  const revPct = totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : '—';
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: colors.text }}>{p.name}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: colors.text }}>{p.sold.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: colors.text }}>${p.revenue.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: colors.textSecondary }}>${p.cogs.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: margin > 0 ? '#16a34a' : '#dc2626' }}>
                        {p.revenue > 0 ? `${marginPct}%` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: colors.textSecondary }}>{revPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
