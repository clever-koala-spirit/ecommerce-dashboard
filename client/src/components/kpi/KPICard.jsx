import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { MoreHorizontal } from 'lucide-react';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDelta,
} from '../../utils/formatters';
import { COLORS } from '../../utils/colors';

export default function KPICard({
  title,
  value,
  previousValue,
  format = 'currency',
  prefix = '',
  suffix = '',
  sparklineData = [],
  icon: Icon,
  accentColor = COLORS.BLUE[500],
  loading = false,
  unavailable = false,
  unavailableMessage = 'Connect ad platforms to see this metric',
}) {
  const formatValue = () => {
    switch (format) {
      case 'currency': return formatCurrency(value);
      case 'number': return formatNumber(value);
      case 'percent': return formatPercent(value / 100);
      case 'ratio': return value.toFixed(2) + 'x';
      default: return formatCurrency(value);
    }
  };

  const delta = formatDelta(value, previousValue);
  const isPositive = delta.positive;
  const deltaColor = isPositive ? 'var(--color-green)' : 'var(--color-red)';
  const deltaColorRaw = isPositive ? '#22c55e' : '#ef4444';

  const sparklineChartData = sparklineData.map((val) => ({ value: val }));

  if (loading) {
    return (
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', minHeight: '150px', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
        <div className="skeleton" style={{ width: '30%', height: '12px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '60%', height: '28px', marginTop: '12px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ width: '35%', height: '10px', marginTop: '8px', borderRadius: '6px' }} />
      </div>
    );
  }

  if (unavailable) {
    return (
      <div className="rounded-2xl p-5 relative" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', opacity: 0.7, transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
        <div className="flex items-center justify-between mb-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}15` }}>
              <Icon size={18} style={{ color: accentColor }} />
            </div>
          )}
          <MoreHorizontal size={16} style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <div className="text-xs font-medium mb-1 category-label">{title}</div>
        <div className="text-2xl font-semibold" style={{ color: 'var(--color-text-muted)' }}>—</div>
        <div className="text-[11px] mt-2" style={{ color: 'var(--color-text-muted)' }}>{unavailableMessage}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 relative group transition-all duration-200" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="flex items-center justify-between mb-3">
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}15` }}>
            <Icon size={18} style={{ color: accentColor }} />
          </div>
        )}
        <MoreHorizontal size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-muted)' }} />
      </div>

      <div className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>{title}</div>

      <div className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {prefix}{formatValue()}{suffix}
      </div>

      <div className="flex items-center justify-between gap-3">
        {previousValue != null && (
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{
              background: delta.positive === null ? 'rgba(128,128,128,0.12)' : isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: delta.positive === null ? 'var(--color-text-muted)' : deltaColor,
            }}
          >
            {delta.positive === null ? '' : isPositive ? '↑' : '↓'} {delta.value}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>vs previous</span>
        </div>
        )}

        {sparklineChartData.length > 1 && (
          <div className="w-16 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineChartData}>
                <defs>
                  <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={deltaColorRaw} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={deltaColorRaw} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={deltaColorRaw} strokeWidth={1.5} fill={`url(#spark-${title})`} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
