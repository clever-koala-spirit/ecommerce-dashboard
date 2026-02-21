import { useEffect, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../store/useStore';
import SEO from '../components/common/SEO';
import DateRangePicker from '../components/common/DateRangePicker';
import { formatCurrency, formatPercent, filterDataByDateRange, getPreviousPeriod } from '../utils/formatters';
import { COLORS } from '../utils/colors';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

function WaterfallItem({ label, value, total, isTotal, isSubtraction, color, colors }) {
  const pct = total > 0 ? Math.abs(value) / total * 100 : 0;
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-200 group"
      style={{ background: isTotal ? `${color}12` : 'transparent' }}
      onMouseEnter={(e) => { if (!isTotal) e.currentTarget.style.background = colors.theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={(e) => { if (!isTotal) e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full" style={{ background: color }} />
        <span className={`text-sm ${isTotal ? 'font-semibold' : 'font-medium'}`} style={{ color: colors.text }}>{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32 h-2 rounded-full overflow-hidden" style={{ background: colors.theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
        </div>
        <span className={`text-sm font-mono min-w-[100px] text-right ${isTotal ? 'font-bold' : 'font-medium'}`}
          style={{ color: isSubtraction ? COLORS.RED[500] : color }}>
          {isSubtraction ? '−' : ''}{formatCurrency(Math.abs(value))}
        </span>
        <span className="text-xs min-w-[50px] text-right" style={{ color: colors.textSecondary }}>
          {pct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export default function ProfitLossPage() {
  const { colors, theme } = useTheme();
  const shopifyData = useStore(s => s.shopifyData);
  const googleData = useStore(s => s.googleData);
  const metaData = useStore(s => s.metaData);
  const fixedCosts = useStore(s => s.fixedCosts);
  const dateRange = useStore(s => s.dateRange);
  const fetchDashboardData = useStore(s => s.fetchDashboardData);

  useEffect(() => {
    if (!shopifyData?.length) fetchDashboardData(dateRange);
  }, []);

  const pnl = useMemo(() => {
    const filtered = filterDataByDateRange(shopifyData || [], dateRange);
    const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
    const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);
    const prev = getPreviousPeriod(dateRange);
    const prevFiltered = filterDataByDateRange(shopifyData || [], prev);
    const prevMeta = filterDataByDateRange(metaData || [], prev);
    const prevGoogle = filterDataByDateRange(googleData || [], prev);

    const sum = (arr, p) => arr.reduce((s, d) => s + (d[p] || 0), 0);

    const revenue = sum(filtered, 'grossRevenue') || sum(filtered, 'revenue');
    const refunds = sum(filtered, 'refundAmount');
    const netRevenue = revenue - refunds;
    const cogs = sum(filtered, 'cogs');
    const grossProfit = netRevenue - cogs;
    const metaSpend = sum(filteredMeta, 'spend');
    const googleSpend = sum(filteredGoogle, 'spend');
    const totalAdSpend = metaSpend + googleSpend;
    const monthlyFixed = (fixedCosts || []).filter(c => c.isActive !== false).reduce((s, c) => s + (c.monthlyAmount || 0), 0);
    const periodFixed = (monthlyFixed / 30) * filtered.length;
    const totalExpenses = totalAdSpend + periodFixed;
    const netProfit = grossProfit - totalExpenses;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    // Previous period
    const prevRevenue = sum(prevFiltered, 'grossRevenue') || sum(prevFiltered, 'revenue');
    const prevNetProfit = prevRevenue - sum(prevFiltered, 'refundAmount') - sum(prevFiltered, 'cogs') - sum(prevMeta, 'spend') - sum(prevGoogle, 'spend') - (monthlyFixed / 30) * prevFiltered.length;

    // Daily P&L for chart
    const dailyPnl = filtered.map(d => {
      const mItem = filteredMeta.find(m => m.date === d.date);
      const gItem = filteredGoogle.find(g => g.date === d.date);
      const dayRev = d.grossRevenue || d.revenue || 0;
      const dayCogs = d.cogs || 0;
      const dayRefunds = d.refundAmount || 0;
      const dayAdSpend = (mItem?.spend || 0) + (gItem?.spend || 0);
      const dayFixed = monthlyFixed / 30;
      const dayProfit = dayRev - dayRefunds - dayCogs - dayAdSpend - dayFixed;
      return {
        date: d.date?.slice(5) || '',
        revenue: dayRev,
        profit: dayProfit,
        cogs: dayCogs,
        adSpend: dayAdSpend,
      };
    });

    // Cost breakdown for pie
    const costBreakdown = [
      { name: 'COGS', value: cogs, color: COLORS.ORANGE[500] },
      { name: 'Meta Ads', value: metaSpend, color: '#1877F2' },
      { name: 'Google Ads', value: googleSpend, color: '#EA4335' },
      { name: 'Fixed Costs', value: periodFixed, color: COLORS.GRAY[500] },
      { name: 'Refunds', value: refunds, color: COLORS.RED[400] },
    ].filter(c => c.value > 0);

    return {
      revenue, refunds, netRevenue, cogs, grossProfit, grossMargin,
      metaSpend, googleSpend, totalAdSpend, periodFixed, totalExpenses,
      netProfit, netMargin, prevRevenue, prevNetProfit, dailyPnl, costBreakdown,
    };
  }, [shopifyData, metaData, googleData, fixedCosts, dateRange]);

  const revDelta = pnl.prevRevenue > 0 ? ((pnl.revenue - pnl.prevRevenue) / pnl.prevRevenue * 100) : 0;
  const profitDelta = pnl.prevNetProfit !== 0 ? ((pnl.netProfit - pnl.prevNetProfit) / Math.abs(pnl.prevNetProfit) * 100) : 0;

  const PnlTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="p-3 rounded-xl shadow-lg" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <p className="text-xs font-semibold mb-1" style={{ color: colors.text }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 page-content" style={{ maxWidth: '1440px' }}>
      <SEO title="Profit & Loss" description="Detailed profit and loss breakdown" path="/profit-loss" />

      {/* Header with Date Range Picker */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Profit & Loss</h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Complete financial breakdown of your business</p>
        </div>
        <div className="lg:w-80">
          <DateRangePicker />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Revenue', value: pnl.revenue, delta: revDelta, color: COLORS.BLUE[500] },
          { label: 'Gross Profit', value: pnl.grossProfit, delta: null, color: COLORS.GREEN[500], sub: `${pnl.grossMargin.toFixed(1)}% margin` },
          { label: 'Total Expenses', value: pnl.totalAdSpend + pnl.periodFixed + pnl.cogs + pnl.refunds, delta: null, color: COLORS.ORANGE[500] },
          { label: 'Net Profit', value: pnl.netProfit, delta: profitDelta, color: pnl.netProfit >= 0 ? COLORS.GREEN[500] : COLORS.RED[500], sub: `${pnl.netMargin.toFixed(1)}% margin` },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl p-5" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>{card.label}</p>
            <p className="text-2xl font-bold" style={{ color: card.color }}>{formatCurrency(card.value)}</p>
            {card.delta != null && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md mt-1 inline-block"
                style={{
                  background: card.delta >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: card.delta >= 0 ? COLORS.GREEN[500] : COLORS.RED[500],
                }}>
                {card.delta >= 0 ? '↑' : '↓'} {Math.abs(card.delta).toFixed(1)}% vs prev
              </span>
            )}
            {card.sub && <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue vs Profit Chart */}
      <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Revenue vs Profit Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pnl.dailyPnl} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
            <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<PnlTooltip />} />
            <Bar dataKey="revenue" name="Revenue" fill={COLORS.BLUE[500]} radius={[4,4,0,0]} opacity={0.3} />
            <Bar dataKey="profit" name="Profit" radius={[4,4,0,0]}>
              {pnl.dailyPnl.map((entry, i) => (
                <Cell key={i} fill={entry.profit >= 0 ? COLORS.GREEN[500] : COLORS.RED[500]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Waterfall */}
        <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <h3 className="font-semibold mb-4" style={{ color: colors.text }}>P&L Breakdown</h3>
          <div className="space-y-1">
            <WaterfallItem label="Gross Revenue" value={pnl.revenue} total={pnl.revenue} isTotal color={COLORS.BLUE[500]} colors={{ ...colors, theme }} />
            <WaterfallItem label="Refunds" value={pnl.refunds} total={pnl.revenue} isSubtraction color={COLORS.RED[400]} colors={{ ...colors, theme }} />
            <WaterfallItem label="COGS" value={pnl.cogs} total={pnl.revenue} isSubtraction color={COLORS.ORANGE[500]} colors={{ ...colors, theme }} />
            <div className="border-t my-2" style={{ borderColor: colors.border }} />
            <WaterfallItem label="Gross Profit" value={pnl.grossProfit} total={pnl.revenue} isTotal color={COLORS.GREEN[500]} colors={{ ...colors, theme }} />
            <WaterfallItem label="Meta Ads" value={pnl.metaSpend} total={pnl.revenue} isSubtraction color="#1877F2" colors={{ ...colors, theme }} />
            <WaterfallItem label="Google Ads" value={pnl.googleSpend} total={pnl.revenue} isSubtraction color="#EA4335" colors={{ ...colors, theme }} />
            <WaterfallItem label="Fixed Costs" value={pnl.periodFixed} total={pnl.revenue} isSubtraction color={COLORS.GRAY[500]} colors={{ ...colors, theme }} />
            <div className="border-t my-2" style={{ borderColor: colors.border }} />
            <WaterfallItem label="Net Profit" value={pnl.netProfit} total={pnl.revenue} isTotal color={pnl.netProfit >= 0 ? COLORS.GREEN[600] : COLORS.RED[600]} colors={{ ...colors, theme }} />
          </div>
        </div>

        {/* Cost Breakdown Pie */}
        <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pnl.costBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={2}>
                {pnl.costBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.text }} />
              <Legend formatter={(value) => <span style={{ color: colors.textSecondary, fontSize: '12px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
