import { addDays, addMonths, addWeeks, addYears, isBefore, parseISO, startOfDay } from 'date-fns';

const PERIOD_MAP: Record<string, (date: Date) => Date> = {
  mensal: (date) => addMonths(date, 1),
  monthly: (date) => addMonths(date, 1),
  trimestral: (date) => addMonths(date, 3),
  quarterly: (date) => addMonths(date, 3),
  semestral: (date) => addMonths(date, 6),
  semiannual: (date) => addMonths(date, 6),
  anual: (date) => addYears(date, 1),
  yearly: (date) => addYears(date, 1),
  semanal: (date) => addWeeks(date, 1),
  weekly: (date) => addWeeks(date, 1),
  outro: (date) => addDays(date, 30),
  other: (date) => addDays(date, 30),
};

export function getNextRenewalDate(renewalDate: string, period?: string) {
  if (!period) return null;
  const base = parseISO(renewalDate);
  if (Number.isNaN(base.getTime())) return null;
  const key = period.trim().toLowerCase();
  const advance = PERIOD_MAP[key];
  if (!advance) return null;
  return advance(base);
}

export function getAutoRenewedDate(renewalDate: string, period?: string, now = new Date()) {
  if (!period) return null;
  const base = parseISO(renewalDate);
  if (Number.isNaN(base.getTime())) return null;
  const key = period.trim().toLowerCase();
  const advance = PERIOD_MAP[key];
  if (!advance) return null;

  const today = startOfDay(now);
  let next = base;
  let iterations = 0;

  while (isBefore(next, today) && iterations < 60) {
    next = advance(next);
    iterations += 1;
  }

  if (next.getTime() === base.getTime()) return null;
  return next;
}
