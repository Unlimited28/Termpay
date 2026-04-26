import React from 'react';

type SkeletonVariant = 'text' | 'card' | 'table' | 'stats';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

export function LoadingSkeleton({ variant = 'text', className = '' }: LoadingSkeletonProps) {
  const baseClass = "bg-slate-100 rounded-lg relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

  if (variant === 'text') {
    return <div className={`${baseClass} h-4 w-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`p-6 bg-white border border-surface-border rounded-xl shadow-premium ${className}`}>
        <div className={`${baseClass} h-6 w-1/3 mb-4`} />
        <div className={`${baseClass} h-4 w-full mb-2`} />
        <div className={`${baseClass} h-4 w-5/6`} />
      </div>
    );
  }

  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 bg-white border border-surface-border rounded-xl h-[120px] shadow-sm">
            <div className={`${baseClass} h-4 w-1/2 mb-3`} />
            <div className={`${baseClass} h-8 w-3/4`} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`bg-white border border-surface-border rounded-xl shadow-premium overflow-hidden ${className}`}>
        <div className="p-4 border-b border-surface-border flex gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className={`${baseClass} h-4 flex-1`} />)}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-surface-border flex gap-4 last:border-0">
            {[...Array(4)].map((_, j) => <div key={j} className={`${baseClass} h-6 flex-1`} />)}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
