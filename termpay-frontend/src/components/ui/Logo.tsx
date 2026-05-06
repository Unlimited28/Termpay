interface LogoProps {
  variant?: 'dark' | 'light'
  className?: string
  showDot?: boolean
}

const Logo = ({ className = '', showDot = false }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 font-bold text-xl tracking-tighter ${className}`}>
      <div className="flex items-center">
        <span className="text-ink-primary">Term</span>
        <span className="text-emerald">Pay</span>
      </div>
      {showDot && (
        <div className="w-2 h-2 rounded-full bg-emerald animate-glow-pulse" />
      )}
    </div>
  )
}

export default Logo
