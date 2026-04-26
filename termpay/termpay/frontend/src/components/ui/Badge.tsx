import React from 'react';

type BadgeVariant = 'paid' | 'partial' | 'unpaid' | 'high' | 'medium' | 'review' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'info', size = 'md', children, className = '' }: BadgeProps) {
  const variants = {
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-orange-100 text-orange-700',
    unpaid: 'bg-red-100 text-red-700',
    high: 'bg-red-100 text-red-700',
    medium: 'bg-blue-100 text-blue-700',
    review: 'bg-purple-100 text-purple-700',
    info: 'bg-slate-100 text-slate-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span className={`inline-flex items-center font-bold rounded-full uppercase tracking-wider ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
