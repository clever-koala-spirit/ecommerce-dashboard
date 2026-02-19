import { useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../store/useStore';
import SEO from '../components/common/SEO';
import { formatCurrency, formatNumber, filterDataByDateRange, getPreviousPeriod } from '../utils/formatters';
import { COLORS } from '../utils/colors';
import EmptyState from '../components/common/EmptyState';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

function MetricCard({ label, value, format = 'currency', delta, color, colors }) {
  const formatted = format === 'currency' ? formatCurrency(value)
    : format === 'ratio' ? `${value.toFixed(2)}x`
    : format === 'percent' ? `${value.toFixed(1)}%`
    : formatNumber(value);
  return (
    <div className="rounded-2xl p-5" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
      <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: color || colors.text }}>{formatted}</p>
      {delta != null && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md mt-1 inline-block"
          style={{
            background: delta >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
            color: delta >= 0 ? COLORS.GREEN[500] : COLORS.RED[500],
          }}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
        </span>
      )}
    </div>
  );
}

function ChannelRow({ channel, spend, revenue, roas, clicks, impressions, ctr, cpc, colors }) {
  return (
    <tr className="transition-colors duration-150"
      onMouseEnter={(e) => e.currentTarget.style.background = colors.theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: channel === 'Meta' ? '#1877F2' : '#EA4335' }} />
          <span className="text-sm font-medium" style={{ color: colors.text }}>{channel}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.text }}>{formatCurrency(spend)}</td>
      <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.text }}>{formatCurrency(revenue)}</td>
      <td className="py-3 px-4 text-right">
        <span className="text-sm font-semibold px-2 py-0.5 rounded-md"
          style={{
            color: roas >= 2 ? COLORS.GREEN[500] : roas >= 1 ? COLORS.YELLOW[600] : COLORS.RED[500],
            background: roas >= 2 ? 'rgba(34,197,94,0.12)' : roas >= 1 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
          }}>
          {roas.toFixed(2)}x
        </span>
      </td>
      <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.textSecondary }}>{formatNumber(clicks)}</td>
      <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.textSecondary }}>{formatNumber(impressions)}</td>
      <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.textSecondary }}>{ctr.toFixed(2)}%</td>
      <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.textSecondary }}>{formatCurrency(cpc)}</td>
    </tr>
  );
}

export default function MarketingPage() {
  const { colors, theme } = useTheme();
  const shopifyData = useStore(s => s.shopifyData);
  const googleData = useStore(s => s.googleData);
  const metaData = useStore(s => s.metaData);
  const dateRange = useStore(s => s.dateRange);
  const fetchDashboardData = useStore(s => s.fetchDashboardData);

  useEffect(() => {
    if (!metaData?.length && !googleData?.length) fetchDashboardData(dateRange);
  }, []);

  const data = useMemo(() => {
    const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
    const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);
    const filteredShopify = filterDataByDateRange(shopifyData || [], dateRange);
    const prev = getPreviousPeriod(dateRange);
    const prevMeta = filterDataByDateRange(metaData || [], prev);
    const prevGoogle = filterDataByDateRange(googleData || [], prev);

    const sum = (arr, p) => arr.reduce((s, d) => s + (d[p] || 0), 0);

    const metaSpend = sum(filteredMeta, 'spend');
    const metaRevenue = sum(filteredMeta, 'revenue');
    const metaClicks = sum(filteredMeta, 'clicks');
    const metaImpressions = sum(filteredMeta, 'impressions');
    const googleSpend = sum(filteredGoogle, 'spend');
    const googleRevenue = sum(filteredGoogle, 'conversionValue');
    const googleClicks = sum(filteredGoogle, 'clicks');
    const googleImpressions = sum(filteredGoogle, 'impressions');

    const totalSpend = metaSpend + googleSpend;
    const totalRevenue = metaRevenue + googleRevenue;
    const blendedRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const totalClicks = metaClicks + googleClicks;
    const totalImpressions = metaImpressions + googleImpressions;
    const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const blendedCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;

    // Shopify revenue for MER
    const shopRevenue = sum(filteredShopify, 'grossRevenue') || sum(filteredShopify, 'revenue');
    const mer = totalSpend > 0 ? shopRevenue / totalSpend : 0;

    // New customers for CAC
    const newCustomers = sum(filteredShopify, 'newCustomers');
    const cac = newCustomers > 0 ? totalSpend / newCustomers : 0;

    const prevTotalSpend = sum(prevMeta, 'spend') + sum(prevGoogle, 'spend');
    const prevTotalRevenue = sum(prevMeta, 'revenue') + sum(prevGoogle, 'conversionValue');
    const spendDelta = prevTotalSpend > 0 ? ((totalSpend - prevTotalSpend) / prevTotalSpend) * 100 : 0;
    const revDelta = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;

    // Daily spend trend
    const dailyTrend = filteredShopify.map(d => {
      const m = filteredMeta.find(x => x.date === d.date);
      const g = filteredGoogle.find(x => x.date === d.date);
      return {
        date: d.date?.slice(5) || '',
        metaSpend: m?.spend || 0,
        googleSpend: g?.spend || 0,
        metaROAS: m?.spend > 0 ? (m?.revenue || 0) / m.spend : 0,
        googleROAS: g?.spend > 0 ? (g?.conversionValue || 0) / g.spend : 0,
      };
    });

    return {
      totalSpend, totalRevenue, blendedRoas, blendedCtr, blendedCpc, mer, cac,
      totalClicks, totalImpressions, newCustomers, spendDelta, revDelta,
      meta: { spend: metaSpend, revenue: metaRevenue, clicks: metaClicks, impressions: metaImpressions, roas: metaSpend > 0 ? metaRevenue / metaSpend : 0, ctr: metaImpressions > 0 ? (metaClicks / metaImpressions) * 100 : 0, cpc: metaClicks > 0 ? metaSpend / metaClicks : 0 },
      google: { spend: googleSpend, revenue: googleRevenue, clicks: googleClicks, impressions: googleImpressions, roas: googleSpend > 0 ? googleRevenue / googleSpend : 0, ctr: googleImpressions > 0 ? (googleClicks / googleImpressions) * 100 : 0, cpc: googleClicks > 0 ? googleSpend / googleClicks : 0 },
      dailyTrend,
    };
  }, [shopifyData, metaData, googleData, dateRange]);

  const hasData = (metaData?.length > 0) || (googleData?.length > 0);

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="p-3 rounded-xl shadow-lg" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <p className="text-xs font-semibold mb-1" style={{ color: colors.text }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {p.name.includes('ROAS') ? `${p.value.toFixed(2)}x` : formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 page-content" style={{ maxWidth: '1440px' }}>
      <SEO title="Marketing" description="Ad performance and marketing analytics" path="/marketing" />

      <div>
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Marketing Performance</h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Track ad spend, ROAS, and acquisition costs across all channels</p>
      </div>

      {!hasData ? (
        <div className="rounded-2xl p-8" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <EmptyState icon="trend" title="No ad data available" message="Connect Meta Ads or Google Ads in Settings to see marketing performance." />
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard label="Total Ad Spend" value={data.totalSpend} delta={data.spendDelta} color={COLORS.RED[500]} colors={colors} />
            <MetricCard label="Ad Revenue" value={data.totalRevenue} delta={data.revDelta} color={COLORS.BLUE[500]} colors={colors} />
            <MetricCard label="Blended ROAS" value={data.blendedRoas} format="ratio" color={data.blendedRoas >= 2 ? COLORS.GREEN[500] : COLORS.YELLOW[600]} colors={colors} />
            <MetricCard label="MER" value={data.mer} format="ratio" color={COLORS.PURPLE[500]} colors={colors} />
            <MetricCard label="Blended CAC" value={data.cac} color={COLORS.ORANGE[500]} colors={colors} />
            <MetricCard label="CTR" value={data.blendedCtr} format="percent" color={COLORS.CYAN[500]} colors={colors} />
          </div>

          {/* Spend + ROAS trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
              <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Daily Ad Spend by Channel</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                  <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="metaSpend" name="Meta Spend" stackId="1" fill="#1877F2" fillOpacity={0.3} stroke="#1877F2" strokeWidth={2} />
                  <Area type="monotone" dataKey="googleSpend" name="Google Spend" stackId="1" fill="#EA4335" fillOpacity={0.3} stroke="#EA4335" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
              <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Daily ROAS by Channel</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.dailyTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                  <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} tickFormatter={v => `${v.toFixed(1)}x`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="metaROAS" name="Meta ROAS" stroke="#1877F2" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="googleROAS" name="Google ROAS" stroke="#EA4335" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Channel Comparison Table */}
          <div className="rounded-2xl p-6 overflow-x-auto" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Channel Comparison</h3>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {['Channel', 'Spend', 'Revenue', 'ROAS', 'Clicks', 'Impressions', 'CTR', 'CPC'].map(h => (
                    <th key={h} className={`py-2 px-4 text-xs font-semibold ${h === 'Channel' ? 'text-left' : 'text-right'}`} style={{ color: colors.textSecondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.meta.spend > 0 && (
                  <ChannelRow channel="Meta" {...data.meta} colors={{ ...colors, theme }} />
                )}
                {data.google.spend > 0 && (
                  <ChannelRow channel="Google" {...data.google} colors={{ ...colors, theme }} />
                )}
                <tr style={{ borderTop: `2px solid ${colors.border}` }}>
                  <td className="py-3 px-4 text-sm font-bold" style={{ color: colors.text }}>Total</td>
                  <td className="py-3 px-4 text-right text-sm font-bold font-mono" style={{ color: colors.text }}>{formatCurrency(data.totalSpend)}</td>
                  <td className="py-3 px-4 text-right text-sm font-bold font-mono" style={{ color: colors.text }}>{formatCurrency(data.totalRevenue)}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-sm font-bold">{data.blendedRoas.toFixed(2)}x</span>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-bold font-mono" style={{ color: colors.text }}>{formatNumber(data.totalClicks)}</td>
                  <td className="py-3 px-4 text-right text-sm font-bold font-mono" style={{ color: colors.text }}>{formatNumber(data.totalImpressions)}</td>
                  <td className="py-3 px-4 text-right text-sm font-bold font-mono" style={{ color: colors.text }}>{data.blendedCtr.toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right text-sm font-bold font-mono" style={{ color: colors.text }}>{formatCurrency(data.blendedCpc)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
