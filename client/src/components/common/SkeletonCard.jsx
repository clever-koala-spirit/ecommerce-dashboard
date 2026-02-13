export default function SkeletonCard({ width = '100%', height = '120px', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
}

export function SkeletonKPI({ className = '' }) {
  return (
    <div
      className={`kpi-card space-y-3 p-5 animate-fadeIn ${className}`}
      style={{ height: '140px', animationDuration: '0.5s' }}
    >
      <SkeletonCard width="30%" height="12px" />
      <SkeletonCard width="60%" height="28px" className="mt-3" />
      <div className="flex justify-between items-center gap-2 pt-3">
        <SkeletonCard width="35%" height="10px" />
        <SkeletonCard width="40%" height="32px" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <div
      className={`glass-card p-5 animate-fadeIn ${className}`}
      style={{ height: '280px', animationDuration: '0.6s' }}
    >
      <SkeletonCard width="40%" height="14px" className="mb-4" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-end gap-2 h-12">
            <SkeletonCard width="8%" height={`${60 - i * 10}px`} />
            <SkeletonCard width="8%" height={`${50 - i * 8}px`} />
            <SkeletonCard width="8%" height={`${70 - i * 12}px`} />
            <SkeletonCard width="8%" height={`${55 - i * 9}px`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ className = '' }) {
  return (
    <div className={`glass-card p-5 animate-fadeIn ${className}`} style={{ minHeight: '200px', animationDuration: '0.6s' }}>
      {/* Header */}
      <div className="flex gap-4 mb-4">
        <SkeletonCard width="25%" height="14px" />
        <SkeletonCard width="25%" height="14px" />
        <SkeletonCard width="25%" height="14px" />
        <SkeletonCard width="15%" height="14px" />
      </div>

      {/* Rows */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 mb-3">
          <SkeletonCard width="25%" height="12px" />
          <SkeletonCard width="25%" height="12px" />
          <SkeletonCard width="25%" height="12px" />
          <SkeletonCard width="15%" height="12px" />
        </div>
      ))}
    </div>
  );
}
