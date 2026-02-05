'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpOptions {
  duration?: number;
  start?: boolean;
}

export function useCountUp(target: number, options?: CountUpOptions) {
  const { duration = 1200, start = true } = options ?? {};
  const [value, setValue] = useState(0);
  const valueRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const setAndStore = (nextValue: number) => {
    valueRef.current = nextValue;
    setValue(nextValue);
  };

  useEffect(() => {
    if (!start) {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setAndStore(0);
      return;
    }

    const from = valueRef.current;
    const to = target;

    if (from === to) {
      setAndStore(to);
      return;
    }

    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = from + (to - from) * eased;
      setAndStore(nextValue);
      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      }
    };

    rafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, duration, start]);

  return value;
}
