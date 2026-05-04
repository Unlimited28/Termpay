import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
      primary: 'bg-navy text-white hover:bg-navy-light',
      secondary: 'bg-white border border-surface-border text-text-primary hover:bg-surface-bg',
      destructive: 'bg-brand-red text-white hover:bg-red-700',
      ghost: 'bg-transparent text-text-secondary hover:bg-surface-bg hover:text-text-primary',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    const variantStyles = variants[variant] || variants.primary
    const sizeStyles = sizes[size] || sizes.md

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} relative`}
        {...props}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
        )}
        <span className={isLoading ? 'opacity-0' : ''}>{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
