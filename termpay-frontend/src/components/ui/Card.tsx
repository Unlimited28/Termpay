interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

const Card = ({ children, className = '', title, subtitle, actions }: CardProps) => {
  return (
    <div className={`bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold text-text-primary">{title}</h3>}
            {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

export default Card
