interface BadgeProps {
  variant?: 'paid' | 'partial' | 'unpaid' | 'info' | 'success' | 'warning' | 'error' | 'neutral'
  children: React.ReactNode
  className?: string
}

const Badge = ({ variant = 'neutral', children, className = '' }: BadgeProps) => {
  const variants = {
    paid: 'bg-green-100 text-brand-green border-green-200',
    partial: 'bg-amber-100 text-brand-amber border-amber-200',
    unpaid: 'bg-red-100 text-brand-red border-red-200',
    success: 'bg-green-100 text-brand-green border-green-200',
    info: 'bg-blue-100 text-brand-blue border-blue-200',
    warning: 'bg-amber-100 text-brand-amber border-amber-200',
    error: 'bg-red-100 text-brand-red border-red-200',
    neutral: 'bg-slate-100 text-text-secondary border-slate-200',
  }

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
