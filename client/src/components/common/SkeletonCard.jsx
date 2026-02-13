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
      className="kpi-card space-y-2 p-5"
      style={{ height: '140px' }}
    >
      <SkeletonCard width="30%" height="12px" />
      <SkeletonCard width="50%" height="28px" className="mt-2" />
      <div className="flex justify-between pt-2">
        <SkeletonCard width="40%" height="10px" />
        <SkeletonCard width="30%" height="10px" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className = '' }) {
  return (
    <div
      className={`glass-card p-5 ${className}`}
      style={{ height: '280px' }}
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
    <div className={`glass-card p-5 ${className}`} style={{ minHeight: '200px' }}>
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
