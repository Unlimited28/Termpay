import { type SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full h-11 px-3 bg-white border rounded-lg text-sm appearance-none outline-none transition-all
              ${error
                ? 'border-brand-red focus:ring-1 focus:ring-brand-red'
                : 'border-surface-border focus:border-navy focus:ring-1 focus:ring-navy'}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-disabled">
            <ChevronDown size={18} />
          </div>
        </div>
        {error && <p className="text-xs text-brand-red">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
