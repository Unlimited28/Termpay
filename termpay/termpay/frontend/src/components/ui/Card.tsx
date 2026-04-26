import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: 'brand-blue' | 'brand-green' | 'brand-amber' | 'brand-red' | 'navy';
}

export function Card({ children, className = '', accentColor }: CardProps) {
  const accents = {
    'brand-blue': 'border-l-4 border-l-brand-blue',
    'brand-green': 'border-l-4 border-l-brand-green',
    'brand-amber': 'border-l-4 border-l-brand-amber',
    'brand-red': 'border-l-4 border-l-brand-red',
    'navy': 'border-l-4 border-l-navy',
  };

  return (
    <div className={`bg-white rounded-xl shadow-premium border border-surface-border overflow-hidden ${accentColor ? accents[accentColor] : ''} ${className}`}>
      {children}
    </div>
  );
}
