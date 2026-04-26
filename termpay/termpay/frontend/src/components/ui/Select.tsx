import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
}

export function Select({ label, options, value, onChange, placeholder = "Select an option", error, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`w-full space-y-1.5 ${className}`} ref={containerRef}>
      {label && <label className="text-sm font-medium text-text-primary block">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full h-10 px-4 py-2 flex items-center justify-between rounded-lg border bg-white text-sm transition-all
            focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue
            ${error ? 'border-brand-red' : 'border-surface-border'}
            ${!selectedOption ? 'text-slate-400' : 'text-text-primary'}
          `}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-surface-border rounded-lg shadow-premium z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar animate-scale-in">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-sm text-left flex items-center justify-between hover:bg-slate-50 transition-colors
                  ${value === option.value ? 'bg-blue-50 text-brand-blue font-medium' : 'text-text-primary'}
                `}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-2 text-sm text-text-secondary italic">No options available</div>
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs font-medium text-brand-red mt-1">{error}</p>}
    </div>
  );
}
