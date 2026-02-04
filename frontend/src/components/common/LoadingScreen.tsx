'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/components/ui/utils';

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoadingIndicatorProps {
  label?: string;
  subLabel?: string;
  slowMessage?: string;
  slowDelayMs?: number;
  size?: LoaderSize;
  className?: string;
}

const sizeMap: Record<LoaderSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export function LoadingIndicator({
  label = 'Carregando...',
  subLabel,
  slowMessage = 'Isso está demorando mais que o esperado…',
  slowDelayMs = 2000,
  size = 'md',
  className,
}: LoadingIndicatorProps) {
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    if (!slowMessage) return;
    const timeoutId = setTimeout(() => setShowSlowMessage(true), slowDelayMs);
    return () => clearTimeout(timeoutId);
  }, [slowMessage, slowDelayMs]);

  return (
    <div className={cn('flex flex-col items-center gap-3', className)} role="status" aria-live="polite">
      <div className={cn('relative', sizeMap[size])} aria-hidden="true">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 motion-safe:animate-pulse motion-reduce:opacity-80" />
        <div className="absolute inset-0 rounded-2xl border border-purple-500/30 motion-safe:animate-[pulse_2.5s_ease-in-out_infinite] motion-reduce:opacity-70" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-emerald-400 to-purple-400 motion-safe:animate-[ping_1.8s_ease-in-out_infinite] motion-reduce:opacity-90" />
        </div>
      </div>
      <p className="text-sm text-zinc-400">{label}</p>
      {subLabel && <p className="text-xs text-zinc-500">{subLabel}</p>}
      {showSlowMessage && (
        <p className="text-xs text-zinc-500">{slowMessage}</p>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}

interface LoadingScreenProps extends LoadingIndicatorProps {
  fullScreen?: boolean;
}

export function LoadingScreen({
  label = 'Carregando...',
  subLabel,
  size = 'md',
  className,
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div className={cn('bg-zinc-950 text-white', fullScreen && 'min-h-screen', className)} aria-busy="true">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_55%),radial-gradient(circle_at_75%_20%,_rgba(139,92,246,0.08),_transparent_45%)]" />
        <div className={cn('relative flex items-center justify-center', fullScreen && 'min-h-screen')}
        >
          <LoadingIndicator label={label} subLabel={subLabel} size={size} />
        </div>
      </div>
    </div>
  );
}
