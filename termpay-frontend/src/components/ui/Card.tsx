interface CardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  accentColor?: string
}

const Card = ({ children, className = '', title, subtitle, actions, accentColor }: CardProps) => {
  return (
    <div
      className={`bg-surface border border-white/[0.06] rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-200 overflow-hidden group ${className}`}
    >
      {accentColor && (
        <div className="h-[3px] w-full" style={{ backgroundColor: accentColor }} />
      )}
      {(title || actions) && (
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.04]">
          <div>
            {title && <h3 className="text-base font-semibold text-ink-primary">{title}</h3>}
            {subtitle && <p className="text-sm text-ink-secondary mt-0.5">{subtitle}</p>}
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
