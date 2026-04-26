import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-medium text-text-primary block">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-brand-blue transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full h-10 rounded-lg border bg-white px-4 py-2 text-sm transition-all
              placeholder:text-slate-400
              focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue
              disabled:bg-slate-50 disabled:text-slate-400
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-brand-red focus:ring-brand-red/20 focus:border-brand-red' : 'border-surface-border'}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-brand-blue transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-brand-red mt-1 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
