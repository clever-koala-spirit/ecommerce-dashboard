import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingCart, RefreshCw, DollarSign } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatCurrency, filterDataByDateRange, getPreviousPeriod } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', backdropFilter: 'blur(20px) saturate(180%)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function TotalSalesChart() {
  const dateRange = useStore((s) => s.dateRange);
  const shopifyData = useStore((s) => s.shopifyData);

  const { chartData, totalSales, prevTotalSales, changePercent, todaySales, totalOrders, totalRefunds } = useMemo(() => {
    const filtered = filterDataByDateRange(shopifyData || [], dateRange);
    const prevRange = getPreviousPeriod(dateRange);
    const prevFiltered = filterDataByDateRange(shopifyData || [], prevRange);

    const totalSales = filtered.reduce((s, d) => s + (d.grossRevenue || d.revenue || 0), 0);
    const prevTotalSales = prevFiltered.reduce((s, d) => s + (d.grossRevenue || d.revenue || 0), 0);
    const changePercent = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0;
    const totalOrders = filtered.reduce((s, d) => s + (d.orders || 0), 0);
    const totalRefunds = filtered.reduce((s, d) => s + (d.refundAmount || 0), 0);

    const todaySales = filtered.length > 0 ? (filtered[filtered.length - 1].grossRevenue || filtered[filtered.length - 1].revenue || 0) : 0;

    const chartData = filtered.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: d.grossRevenue || d.revenue || 0,
    }));

    return { chartData, totalSales, prevTotalSales, changePercent, todaySales, totalOrders, totalRefunds };
  }, [dateRange, shopifyData]);

  const isPositive = changePercent >= 0;
  const changeDiff = totalSales - prevTotalSales;

  if (!chartData.length) {
    return (
      <div className="rounded-2xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Total Sales</h3>
        <EmptyState icon="chart" title="No sales data" message="No orders found in this period." />
      </div>
    );
  }

  const miniStats = [
    { label: 'Online Sales', value: formatCurrency(totalSales), icon: DollarSign, color: '#6366f1' },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: '#22c55e' },
    { label: "Today's Sale", value: formatCurrency(todaySales), icon: TrendingUp, color: '#f59e0b' },
    { label: 'Refunds', value: formatCurrency(totalRefunds), icon: RefreshCw, color: '#ef4444' },
  ];

  return (
    <div className="rounded-2xl p-6" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Total Sales</h3>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatCurrency(totalSales)}</span>
            <span
              className="px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{
                background: isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                color: isPositive ? 'var(--color-green)' : 'var(--color-red)',
              }}
            >
              {isPositive ? '↑' : '↓'} {Math.abs(changePercent).toFixed(1)}%
            </span>
          </div>
          {changeDiff !== 0 && (
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Your sales have {isPositive ? 'increased' : 'decreased'} by {formatCurrency(Math.abs(changeDiff))} from last period
            </p>
          )}
        </div>
      </div>

      {/* Revenue breakdown bar */}
      <div className="h-2 rounded-full overflow-hidden flex mb-6" style={{ background: 'var(--color-bg-primary)' }}>
        <div className="h-full rounded-l-full" style={{ width: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)' }} />
      </div>

      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-chart-grid)" strokeOpacity={0.5} vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#salesGradient)" dot={false} activeDot={{ r: 4, fill: '#6366f1', stroke: 'var(--color-bg-card)', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {miniStats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-4 rounded-xl flex items-center gap-3"
            style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
