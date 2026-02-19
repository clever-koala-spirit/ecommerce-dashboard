import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/common/SEO';
import { useStore } from '../store/useStore';

export default function ReportsPage() {
  const { colors } = useTheme();
  const shopifyData = useStore(s => s.shopifyData);
  const googleData = useStore(s => s.googleData);
  const metaData = useStore(s => s.metaData);
  const fetchDashboardData = useStore(s => s.fetchDashboardData);
  const loading = useStore(s => s.isLoading?.shopify);

  useEffect(() => {
    if (!shopifyData?.length) fetchDashboardData();
  }, []);

  const totalRevenue = (shopifyData || []).reduce((s, d) => s + (d.revenue || d.grossRevenue || 0), 0);
  const totalOrders = (shopifyData || []).reduce((s, d) => s + (d.orders || 0), 0);
  const totalCogs = (shopifyData || []).reduce((s, d) => s + (d.cogs || 0), 0);
  const totalRefunds = (shopifyData || []).reduce((s, d) => s + (d.refunds || 0), 0);

  const googleSpend = (googleData || []).reduce((s, d) => s + (d.spend || 0), 0);
  const googleConv = (googleData || []).reduce((s, d) => s + (d.conversionValue || 0), 0);
  const googleClicks = (googleData || []).reduce((s, d) => s + (d.clicks || 0), 0);

  const metaSpend = (metaData || []).reduce((s, d) => s + (d.spend || 0), 0);
  const metaClicks = (metaData || []).reduce((s, d) => s + (d.clicks || 0), 0);
  const metaImpressions = (metaData || []).reduce((s, d) => s + (d.impressions || 0), 0);

  const totalAdSpend = googleSpend + metaSpend;
  const grossProfit = totalRevenue - totalCogs;
  const netProfit = grossProfit - totalAdSpend - totalRefunds;

  const fmt = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const sections = [
    {
      title: 'Revenue Summary',
      rows: [
        { label: 'Gross Revenue', value: fmt(totalRevenue) },
        { label: 'Refunds', value: fmt(totalRefunds), negative: true },
        { label: 'COGS', value: fmt(totalCogs), negative: true },
        { label: 'Gross Profit', value: fmt(grossProfit), highlight: true },
        { label: 'Gross Margin', value: totalRevenue > 0 ? `${((grossProfit / totalRevenue) * 100).toFixed(1)}%` : '—' },
        { label: 'Total Ad Spend', value: fmt(totalAdSpend), negative: true },
        { label: 'Net Profit', value: fmt(netProfit), highlight: true, positive: netProfit >= 0 },
        { label: 'Net Margin', value: totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '—' },
      ]
    },
    {
      title: 'Orders & Customers',
      rows: [
        { label: 'Total Orders', value: totalOrders.toLocaleString() },
        { label: 'Avg Order Value', value: totalOrders > 0 ? fmt(totalRevenue / totalOrders) : '—' },
        { label: 'Revenue per Day', value: shopifyData?.length > 0 ? fmt(totalRevenue / shopifyData.length) : '—' },
        { label: 'Orders per Day', value: shopifyData?.length > 0 ? (totalOrders / shopifyData.length).toFixed(1) : '—' },
      ]
    },
    {
      title: 'Google Ads',
      rows: [
        { label: 'Spend', value: fmt(googleSpend) },
        { label: 'Clicks', value: googleClicks.toLocaleString() },
        { label: 'Conv. Value', value: fmt(googleConv) },
        { label: 'ROAS', value: googleSpend > 0 ? `${(googleConv / googleSpend).toFixed(2)}x` : '—' },
        { label: 'CPC', value: googleClicks > 0 ? fmt(googleSpend / googleClicks) : '—' },
      ]
    },
    {
      title: 'Meta Ads',
      rows: [
        { label: 'Spend', value: fmt(metaSpend) },
        { label: 'Impressions', value: metaImpressions.toLocaleString() },
        { label: 'Clicks', value: metaClicks.toLocaleString() },
        { label: 'CTR', value: metaImpressions > 0 ? `${((metaClicks / metaImpressions) * 100).toFixed(2)}%` : '—' },
        { label: 'CPC', value: metaClicks > 0 ? fmt(metaSpend / metaClicks) : '—' },
        { label: 'CPM', value: metaImpressions > 0 ? fmt((metaSpend / metaImpressions) * 1000) : '—' },
      ]
    },
    {
      title: 'Blended Performance',
      rows: [
        { label: 'Total Ad Spend', value: fmt(totalAdSpend) },
        { label: 'Total Clicks', value: (googleClicks + metaClicks).toLocaleString() },
        { label: 'Blended CPC', value: (googleClicks + metaClicks) > 0 ? fmt(totalAdSpend / (googleClicks + metaClicks)) : '—' },
        { label: 'Blended ROAS', value: totalAdSpend > 0 ? `${(totalRevenue / totalAdSpend).toFixed(2)}x` : '—' },
        { label: 'Ad Spend % of Revenue', value: totalRevenue > 0 ? `${((totalAdSpend / totalRevenue) * 100).toFixed(1)}%` : '—' },
      ]
    },
  ];

  return (
    <>
      <SEO title="Reports — Slay Season" />
      <div style={{ padding: '32px', maxWidth: 1200 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, marginBottom: 24 }}>Reports</h1>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: colors.textSecondary }}>Loading report data...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {sections.map(section => (
              <div key={section.title} style={{
                background: colors.surface, borderRadius: 12, border: `1px solid ${colors.border}`,
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '16px 20px', borderBottom: `1px solid ${colors.border}`,
                  fontWeight: 600, fontSize: 15, color: colors.text
                }}>{section.title}</div>
                {section.rows.map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '10px 20px',
                    borderBottom: i < section.rows.length - 1 ? `1px solid ${colors.border}22` : 'none',
                    background: row.highlight ? `${colors.accent}08` : 'transparent'
                  }}>
                    <span style={{ fontSize: 14, color: colors.textSecondary, fontWeight: row.highlight ? 600 : 400 }}>{row.label}</span>
                    <span style={{
                      fontSize: 14, fontWeight: row.highlight ? 700 : 500,
                      color: row.highlight ? (row.positive === false ? '#dc2626' : row.positive ? '#16a34a' : colors.text) : colors.text
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
