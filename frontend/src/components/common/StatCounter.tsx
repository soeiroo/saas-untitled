'use client';

import { useCountUp } from '@/utils/useCountUp';

interface StatCounterProps {
  target: number;
  formatter?: (value: number) => string;
  duration?: number;
  start?: boolean;
}

export function StatCounter({ target, formatter, duration, start = true }: StatCounterProps) {
  const value = useCountUp(target, { duration, start });
  const displayValue = formatter ? formatter(value) : Math.round(value).toString();

  return <span>{displayValue}</span>;
}
