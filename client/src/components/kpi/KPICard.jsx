import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { MoreHorizontal, Database } from 'lucide-react';
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
  dataSource,
}) {
  const formatValue = () => {
    if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) return '—';
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
  const deltaColorRaw = isPositive ? '#22c55e' : '#ef4444';

  const sparklineChartData = sparklineData.map((val) => ({ value: val }));

  // Loading skeleton with shimmer
  if (loading) {
    return (
      <div className="rounded-2xl p-5 space-y-3 overflow-hidden" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', minHeight: '140px' }}>
        <div className="flex items-center gap-3">
          <div className="skeleton w-9 h-9 rounded-xl" />
          <div className="skeleton w-20 h-3 rounded-md" />
        </div>
        <div className="skeleton w-28 h-7 rounded-md" />
        <div className="skeleton w-16 h-3 rounded-md" />
      </div>
    );
  }

  // Unavailable state — show dash, never fake data
  if (unavailable) {
    return (
      <div className="rounded-2xl p-5 relative" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', opacity: 0.55 }}>
        <div className="flex items-center justify-between mb-3">
          {Icon && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}10` }}>
              <Icon size={16} style={{ color: accentColor, opacity: 0.5 }} />
            </div>
          )}
        </div>
        <div className="text-[11px] font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>{title}</div>
        <div className="text-2xl font-bold" style={{ color: 'var(--color-text-muted)' }}>—</div>
        <div className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{unavailableMessage}</div>
      </div>
    );
  }

  const displayValue = formatValue();

  return (
    <div
      className="rounded-2xl p-5 relative group cursor-default overflow-hidden"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentColor}40`;
        e.currentTarget.style.boxShadow = `0 8px 32px ${accentColor}12`;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Background sparkline - subtle */}
      {sparklineChartData.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.06] pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Area type="monotone" dataKey="value" stroke="none" fill={accentColor} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative z-10">
        {/* Icon + title row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105" style={{ background: `${accentColor}12` }}>
                <Icon size={16} style={{ color: accentColor }} />
              </div>
            )}
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)', letterSpacing: '0.05em' }}>
              {title}
            </span>
          </div>
        </div>

        {/* Value */}
        <div className="text-[26px] font-bold tracking-tight mb-2" style={{
          color: displayValue === '—' ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
          fontFeatureSettings: '"tnum"',
          lineHeight: 1.1,
        }}>
          {prefix}{displayValue}{suffix}
        </div>

        {/* Delta + sparkline */}
        <div className="flex items-center justify-between gap-2">
          {previousValue != null ? (
            <div className="flex items-center gap-1.5">
              <span
                className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-tight transition-all duration-200"
                style={{
                  background: delta.positive === null ? 'rgba(128,128,128,0.1)' : isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: delta.positive === null ? 'var(--color-text-muted)' : deltaColorRaw,
                }}
              >
                {delta.positive === null ? '—' : isPositive ? '↑' : '↓'} {delta.value}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>vs prev</span>
            </div>
          ) : (
            <div />
          )}

          {sparklineChartData.length > 1 && (
            <div className="w-20 h-8 opacity-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineChartData}>
                  <defs>
                    <linearGradient id={`spark-${title}-v2`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke={accentColor} strokeWidth={1.5} fill={`url(#spark-${title}-v2)`} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
