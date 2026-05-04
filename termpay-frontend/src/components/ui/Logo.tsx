interface LogoProps {
  variant?: 'dark' | 'white'
  className?: string
}

const Logo = ({ variant = 'dark', className = '' }: LogoProps) => {
  const isWhite = variant === 'white'

  return (
    <div className={`flex items-center gap-1.5 font-bold text-xl tracking-tight ${className}`}>
      <span className={isWhite ? 'text-white' : 'text-navy'}>Term</span>
      <span style={{ color: '#4CAF50' }}>Pay</span>
      <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: '#4CAF50' }} />
    </div>
  )
}

export default Logo
