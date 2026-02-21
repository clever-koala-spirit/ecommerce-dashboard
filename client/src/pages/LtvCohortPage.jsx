import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../store/useStore';
import SEO from '../components/common/SEO';
import { formatCurrency, formatNumber, filterDataByDateRange, getPreviousPeriod } from '../utils/formatters';
import { COLORS } from '../utils/colors';
import EmptyState from '../components/common/EmptyState';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function LtvCohortPage() {
  const { colors, theme } = useTheme();
  const shopifyData = useStore(s => s.shopifyData);
  const metaData = useStore(s => s.metaData);
  const googleData = useStore(s => s.googleData);
  const dateRange = useStore(s => s.dateRange);
  const fetchDashboardData = useStore(s => s.fetchDashboardData);

  useEffect(() => {
    if (!shopifyData?.length) fetchDashboardData(dateRange);
  }, []);

  const data = useMemo(() => {
    const filtered = filterDataByDateRange(shopifyData || [], dateRange);
    const filteredMeta = filterDataByDateRange(metaData || [], dateRange);
    const filteredGoogle = filterDataByDateRange(googleData || [], dateRange);

    const sum = (arr, p) => arr.reduce((s, d) => s + (d[p] || 0), 0);

    const totalRevenue = sum(filtered, 'grossRevenue') || sum(filtered, 'revenue');
    const totalOrders = sum(filtered, 'orders');
    const totalNewCustomers = sum(filtered, 'newCustomers');
    const totalReturningCustomers = sum(filtered, 'returningCustomers');
    const totalCustomers = totalNewCustomers + totalReturningCustomers;

    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const purchaseFrequency = totalCustomers > 0 ? totalOrders / totalCustomers : 1;
    const estimatedLtv = aov * purchaseFrequency * 3; // 3x multiplier for lifetime

    const totalAdSpend = sum(filteredMeta, 'spend') + sum(filteredGoogle, 'spend');
    const cac = totalNewCustomers > 0 ? totalAdSpend / totalNewCustomers : 0;
    const ltvCacRatio = cac > 0 ? estimatedLtv / cac : 0;

    const repeatRate = totalCustomers > 0 ? (totalReturningCustomers / totalCustomers) * 100 : 0;
    const revenuePerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Monthly cohort data (group by month)
    const monthMap = {};
    filtered.forEach(d => {
      const month = d.date?.slice(0, 7) || 'Unknown';
      if (!monthMap[month]) monthMap[month] = { month, newCustomers: 0, returningCustomers: 0, revenue: 0, orders: 0 };
      monthMap[month].newCustomers += d.newCustomers || 0;
      monthMap[month].returningCustomers += d.returningCustomers || 0;
      monthMap[month].revenue += d.grossRevenue || d.revenue || 0;
      monthMap[month].orders += d.orders || 0;
    });
    const cohorts = Object.values(monthMap)
      .filter(c => c.month)
      .sort((a, b) => {
        if (!a.month || !b.month) return 0;
        return a.month.localeCompare(b.month);
      });

    // Daily new vs returning
    const dailyCustomers = filtered.map(d => ({
      date: d.date?.slice(5) || '',
      new: d.newCustomers || 0,
      returning: d.returningCustomers || 0,
    }));

    // Revenue per customer trend
    const dailyRpc = filtered.map(d => {
      const customers = (d.newCustomers || 0) + (d.returningCustomers || 0);
      return {
        date: d.date?.slice(5) || '',
        rpc: customers > 0 ? (d.grossRevenue || d.revenue || 0) / customers : 0,
      };
    });

    return {
      totalNewCustomers, totalReturningCustomers, totalCustomers,
      aov, purchaseFrequency, estimatedLtv, cac, ltvCacRatio,
      repeatRate, revenuePerCustomer, cohorts, dailyCustomers, dailyRpc,
    };
  }, [shopifyData, metaData, googleData, dateRange]);

  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="p-3 rounded-xl shadow-lg" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
        <p className="text-xs font-semibold mb-1" style={{ color: colors.text }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.name.includes('$') ? formatCurrency(p.value) : formatNumber(p.value)}
          </p>
        ))}
      </div>
    );
  };

  if (!shopifyData?.length) {
    return (
      <div className="p-6 lg:p-8" style={{ maxWidth: '1440px' }}>
        <SEO title="LTV & Cohorts" path="/ltv" />
        <div className="rounded-2xl p-8" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <EmptyState icon="users" title="No customer data" message="Connect Shopify to see LTV and cohort analytics." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 page-content" style={{ maxWidth: '1440px' }}>
      <SEO title="LTV & Cohorts" description="Customer lifetime value and cohort analysis" path="/ltv" />

      <div>
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>LTV & Cohort Analysis</h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Understand customer lifetime value, retention, and acquisition efficiency</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Est. LTV', value: formatCurrency(data.estimatedLtv), color: COLORS.GREEN[500] },
          { label: 'CAC', value: formatCurrency(data.cac), color: COLORS.ORANGE[500] },
          { label: 'LTV:CAC', value: `${data.ltvCacRatio.toFixed(1)}x`, color: data.ltvCacRatio >= 3 ? COLORS.GREEN[500] : data.ltvCacRatio >= 1 ? COLORS.YELLOW[600] : COLORS.RED[500] },
          { label: 'Repeat Rate', value: `${data.repeatRate.toFixed(1)}%`, color: COLORS.PURPLE[500] },
          { label: 'AOV', value: formatCurrency(data.aov), color: COLORS.BLUE[500] },
          { label: 'Rev/Customer', value: formatCurrency(data.revenuePerCustomer), color: COLORS.CYAN[500] },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-5" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <p className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>{kpi.label}</p>
            <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New vs Returning */}
        <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <h3 className="font-semibold mb-4" style={{ color: colors.text }}>New vs Returning Customers</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.dailyCustomers} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
              <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="new" name="New" stackId="1" fill={COLORS.BLUE[500]} radius={[0,0,0,0]} />
              <Bar dataKey="returning" name="Returning" stackId="1" fill={COLORS.GREEN[500]} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-6 mt-3 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: COLORS.BLUE[500] }} />
              <span className="text-xs" style={{ color: colors.textSecondary }}>New ({formatNumber(data.totalNewCustomers)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: COLORS.GREEN[500] }} />
              <span className="text-xs" style={{ color: colors.textSecondary }}>Returning ({formatNumber(data.totalReturningCustomers)})</span>
            </div>
          </div>
        </div>

        {/* Revenue Per Customer Trend */}
        <div className="rounded-2xl p-6" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Revenue Per Customer Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.dailyRpc} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="date" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
              <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} tickFormatter={v => `$${v.toFixed(0)}`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', color: colors.text }} />
              <Line type="monotone" dataKey="rpc" name="Rev/Customer" stroke={COLORS.PURPLE[500]} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cohort Table */}
      {data.cohorts.length > 0 && (
        <div className="rounded-2xl p-6 overflow-x-auto" style={{ background: colors.bgCard, border: `1px solid ${colors.border}` }}>
          <h3 className="font-semibold mb-4" style={{ color: colors.text }}>Monthly Cohorts</h3>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                {['Month', 'New Customers', 'Returning', 'Revenue', 'Orders', 'Revenue/Customer', 'Repeat Rate'].map(h => (
                  <th key={h} className={`py-2 px-4 text-xs font-semibold ${h === 'Month' ? 'text-left' : 'text-right'}`} style={{ color: colors.textSecondary }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.cohorts.map(c => {
                const total = c.newCustomers + c.returningCustomers;
                const rpc = total > 0 ? c.revenue / total : 0;
                const rr = total > 0 ? (c.returningCustomers / total) * 100 : 0;
                return (
                  <tr key={c.month} className="transition-colors"
                    onMouseEnter={(e) => e.currentTarget.style.background = theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: colors.text }}>{c.month}</td>
                    <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.text }}>{formatNumber(c.newCustomers)}</td>
                    <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.text }}>{formatNumber(c.returningCustomers)}</td>
                    <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.text }}>{formatCurrency(c.revenue)}</td>
                    <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.textSecondary }}>{formatNumber(c.orders)}</td>
                    <td className="py-3 px-4 text-right text-sm font-mono" style={{ color: colors.text }}>{formatCurrency(rpc)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          color: rr >= 30 ? COLORS.GREEN[500] : rr >= 15 ? COLORS.YELLOW[600] : COLORS.RED[500],
                          background: rr >= 30 ? 'rgba(34,197,94,0.12)' : rr >= 15 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                        }}>
                        {rr.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
