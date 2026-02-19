import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/common/SEO';
import { useStore } from '../store/useStore';

export default function CustomersPage() {
  const { colors } = useTheme();
  const shopifyData = useStore(s => s.shopifyData);
  const fetchDashboardData = useStore(s => s.fetchDashboardData);
  const loading = useStore(s => s.isLoading?.shopify);

  useEffect(() => {
    if (!shopifyData?.length) fetchDashboardData();
  }, []);

  // Extract customer data from shopify daily data
  const customerMap = {};
  let totalNewCustomers = 0;
  let totalReturning = 0;

  (shopifyData || []).forEach(day => {
    totalNewCustomers += day.newCustomers || 0;
    totalReturning += day.returningCustomers || 0;
    if (day.customerBreakdown) {
      day.customerBreakdown.forEach(c => {
        const key = c.email || c.name || `customer-${c.id}`;
        if (!customerMap[key]) customerMap[key] = { name: c.name || '—', email: c.email || '—', orders: 0, totalSpent: 0, firstOrder: day.date, lastOrder: day.date };
        customerMap[key].orders += c.orders || 1;
        customerMap[key].totalSpent += c.revenue || 0;
        customerMap[key].lastOrder = day.date;
      });
    }
  });

  const customers = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);
  const totalOrders = (shopifyData || []).reduce((s, d) => s + (d.orders || 0), 0);
  const totalRevenue = (shopifyData || []).reduce((s, d) => s + (d.revenue || d.grossRevenue || 0), 0);
  const uniqueCustomers = customers.length || (totalNewCustomers + totalReturning) || '—';

  return (
    <>
      <SEO title="Customers — Slay Season" />
      <div style={{ padding: '32px', maxWidth: 1200 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 24 }}>Customers</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Customers', value: uniqueCustomers.toLocaleString?.() || uniqueCustomers },
            { label: 'New Customers', value: totalNewCustomers || '—' },
            { label: 'Returning', value: totalReturning || '—' },
            { label: 'Avg LTV', value: customers.length > 0 ? `$${(totalRevenue / customers.length).toFixed(2)}` : '—' },
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
            <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>Loading customers...</div>
          ) : customers.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>
              <p style={{ fontSize: 16, marginBottom: 8 }}>Customer breakdown by individual not yet available</p>
              <p style={{ fontSize: 14 }}>
                Showing aggregate data: {totalOrders} orders, ${totalRevenue.toFixed(2)} revenue across the selected period.
                {totalNewCustomers > 0 && ` ${totalNewCustomers} new customers, ${totalReturning} returning.`}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {['Customer', 'Email', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                      color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500, color: colors.text }}>{c.name}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: colors.textSecondary }}>{c.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: colors.text }}>{c.orders}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: colors.text }}>${c.totalSpent.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: colors.textSecondary }}>{c.lastOrder}</td>
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
