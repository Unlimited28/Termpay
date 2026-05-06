import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary: 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-px shimmer-btn',
      secondary: 'bg-white/4 border border-white/10 text-ink-primary hover:bg-white/8 hover:border-white/16',
      destructive: 'bg-danger-subtle border border-danger/30 text-danger hover:bg-danger/20',
      ghost: 'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-white/4',
    }

    const sizes = {
      sm: 'px-3 h-8 text-xs rounded-lg',
      md: 'px-5 h-[44px] text-sm rounded-[10px]',
      lg: 'px-8 h-12 text-base rounded-[10px]',
    }

    const variantStyles = variants[variant] || variants.primary
    const sizeStyles = sizes[size] || sizes.md

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} relative overflow-hidden`}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        )}
        <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
