interface LoadingSkeletonProps {
  className?: string
  variant?: 'stats' | 'table' | 'card' | 'default'
  rows?: number
}

const LoadingSkeleton = ({ className = '', variant = 'default', rows = 1 }: LoadingSkeletonProps) => {
  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-32 bg-white/[0.03] animate-pulse rounded-[16px] ${className}`} />
        ))}
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className="space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className={`h-12 bg-white/[0.03] animate-pulse rounded-lg ${className}`} />
        ))}
      </div>
    )
  }

  return (
    <div className={`
      bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03]
      bg-[length:200%_100%] animate-shimmer rounded-lg ${className}
    `} />
  )
}

export default LoadingSkeleton
