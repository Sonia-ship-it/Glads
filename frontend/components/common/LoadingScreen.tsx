'use client';

import * as React from 'react';

interface LoadingScreenProps {
  message?: string;
  variant?: 'full' | 'inline' | 'section';
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  variant = 'full',
}) => {
  const base = (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-burgundy/20 animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 rounded-2xl border-2 border-burgundy border-t-transparent animate-spin" />
        <div className="absolute inset-2 w-12 h-12 rounded-xl border-2 border-burgundy/50 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400 animate-pulse">
        {message}
      </p>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md font-(--font-outfit)">
        {base}
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className="min-h-[400px] flex items-center justify-center py-24">
        {base}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{base}</div>;
};
