import { type SelectHTMLAttributes, forwardRef, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', value, onChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value) || options[0]

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (val: string) => {
      if (onChange) {
        const event = {
          target: { value: val, name: props.name }
        } as React.ChangeEvent<HTMLSelectElement>
        onChange(event)
      }
      setIsOpen(false)
    }

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-[13px] font-medium text-ink-secondary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
              w-full h-[44px] px-3.5 bg-white/[0.03] border rounded-[10px] text-sm text-left flex items-center justify-between transition-all outline-none
              ${error
                ? 'border-danger/50 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
                : isOpen
                  ? 'border-emerald/50 shadow-[0_0_0_3px_rgba(16,185,129,0.08)] bg-white/5'
                  : 'border-white/8 hover:border-white/20'}
              ${className}
            `}
          >
            <span className={selectedOption ? 'text-ink-primary' : 'text-ink-muted'}>
              {selectedOption?.label || 'Select option'}
            </span>
            <ChevronDown size={18} className={`text-ink-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Hidden native select for form accessibility/integration */}
          <select
            ref={ref}
            value={value}
            onChange={onChange}
            className="hidden"
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-elevated border border-white/10 rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="py-1 max-h-60 overflow-y-auto">
                {options.map((opt) => {
                  const isSelected = opt.value === value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`
                        w-full h-10 px-3.5 flex items-center justify-between text-sm transition-colors
                        ${isSelected ? 'text-emerald bg-white/[0.02]' : 'text-ink-secondary hover:bg-white/5 hover:text-ink-primary'}
                      `}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={16} className="text-emerald" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
