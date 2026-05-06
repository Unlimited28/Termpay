interface LoadingSkeletonProps {
  className?: string
}

const LoadingSkeleton = ({ className = '' }: LoadingSkeletonProps) => {
  return (
    <div className={`
      bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03]
      bg-[length:200%_100%] animate-shimmer rounded-lg ${className}
    `} />
  )
}

export default LoadingSkeleton
