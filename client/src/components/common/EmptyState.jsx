import { BarChart3, TrendingUp, Mail, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';

const ICONS = {
  chart: BarChart3,
  trend: TrendingUp,
  email: Mail,
  money: DollarSign,
  warning: AlertTriangle,
};

export default function EmptyState({ icon = 'chart', title, message, className = '' }) {
  const Icon = ICONS[icon] || BarChart3;

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 animate-fadeIn ${className}`}>
      <div
        className="rounded-full p-4 mb-4"
        style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}
      >
        <Icon size={32} style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }} />
      </div>
      {title && (
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </p>
      )}
      <p className="text-sm text-center max-w-xs" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>
        {message}
      </p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 animate-fadeIn ${className}`}>
      <div
        className="rounded-full p-4 mb-4"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
      >
        <AlertTriangle size={32} style={{ color: '#ef4444', opacity: 0.7 }} />
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Failed to load data
      </p>
      <p className="text-sm text-center max-w-xs mb-4" style={{ color: 'var(--color-text-secondary)', opacity: 0.7 }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: 'var(--color-accent, #6366f1)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}
