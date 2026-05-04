interface LoadingSkeletonProps {
  className?: string
}

const LoadingSkeleton = ({ className = '' }: LoadingSkeletonProps) => {
  return (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
  )
}

export default LoadingSkeleton
