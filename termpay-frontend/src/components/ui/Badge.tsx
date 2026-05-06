interface BadgeProps {
  variant?: 'paid' | 'partial' | 'unpaid' | 'info' | 'success' | 'warning' | 'error' | 'neutral' | 'high confidence' | 'medium confidence'
  children: React.ReactNode
  className?: string
}

const Badge = ({ variant = 'neutral', children, className = '' }: BadgeProps) => {
  const variants = {
    paid: 'bg-emerald/12 border-emerald/25 text-emerald-light',
    success: 'bg-emerald/12 border-emerald/25 text-emerald-light',
    'high confidence': 'bg-emerald/12 border-emerald/25 text-emerald-light',

    partial: 'bg-warning/12 border-warning/25 text-warning-light',
    warning: 'bg-warning/12 border-warning/25 text-warning-light',
    'medium confidence': 'bg-warning/12 border-warning/25 text-warning-light',

    unpaid: 'bg-danger/12 border-danger/25 text-danger-light',
    error: 'bg-danger/12 border-danger/25 text-danger-light',
    danger: 'bg-danger/12 border-danger/25 text-danger-light',

    info: 'bg-info/12 border-info/25 text-info-light',
    neutral: 'bg-white/4 border-white/10 text-ink-secondary',
  }

  // Fallback to neutral if variant not found
  const variantStyle = variants[variant as keyof typeof variants] || variants.neutral

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${variantStyle} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
