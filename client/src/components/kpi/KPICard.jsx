import { LineChart, Line, Area, AreaChart, ResponsiveContainer } from 'recharts';
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
}) {
  // Format the main value
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return formatNumber(value);
      case 'percent':
        return formatPercent(value / 100);
      case 'ratio':
        return value.toFixed(2) + 'x';
      default:
        return formatCurrency(value);
    }
  };

  // Calculate delta
  const delta = formatDelta(value, previousValue);
  const isPositive = delta.positive;
  const deltaColor = isPositive ? COLORS.GREEN[600] : COLORS.RED[600];

  // Prepare sparkline data with proper structure
  const sparklineChartData = sparklineData.map((val) => ({
    value: val,
  }));

  // Loading state
  if (loading) {
    return (
      <div className="kpi-card space-y-2 p-5" style={{ minHeight: '140px' }}>
        <div
          className="skeleton"
          style={{ width: '30%', height: '12px' }}
        />
        <div
          className="skeleton"
          style={{ width: '50%', height: '28px', marginTop: '8px' }}
        />
        <div className="flex justify-between pt-2">
          <div
            className="skeleton"
            style={{ width: '40%', height: '10px' }}
          />
          <div
            className="skeleton"
            style={{ width: '30%', height: '10px' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="kpi-card relative group overflow-hidden">
      {/* Icon in top-right corner */}
      {Icon && (
        <div
          className="absolute top-4 right-4 opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ color: accentColor }}
        >
          <Icon size={24} />
        </div>
      )}

      {/* Title */}
      <div className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
        {title}
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-2 mt-2">
        <div
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {prefix}
          {formatValue()}
          {suffix}
        </div>
      </div>

      {/* Delta badge + Sparkline row */}
      <div className="flex items-center justify-between mt-4 gap-3">
        {/* Delta badge */}
        <div
          className="px-2 py-1 rounded text-xs font-semibold flex items-center gap-1"
          style={{
            backgroundColor: isPositive
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            color: deltaColor,
          }}
        >
          <span>{isPositive ? '▲' : '▼'}</span>
          <span>{delta.value}</span>
        </div>

        {/* Sparkline */}
        {sparklineChartData.length > 1 && (
          <div className="flex-1 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineChartData}>
                <defs>
                  <linearGradient
                    id={`sparkline-gradient-${title}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={deltaColor}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={deltaColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={deltaColor}
                  strokeWidth={2}
                  fill={`url(#sparkline-gradient-${title})`}
                  isAnimationActive={true}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
