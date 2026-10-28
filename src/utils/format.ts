import { CURRENCY_CODE } from '../config/env';

const money = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: CURRENCY_CODE,
  currencyDisplay: 'narrowSymbol',
});

const compactMoney = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatMoney(value: number): string {
  return money.format(value);
}

/** Short number for chart axes: 1.5K, 2M. */
export function formatCompact(value: number): string {
  return compactMoney.format(value);
}

/** "2026-10" -> "Oct 2026" (or "Oct" when `withYear` is false). */
export function formatMonth(month: string, withYear = true): string {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

/** "2026-10-22" -> "22 Oct 2026". Parsed by hand so the time zone can never shift the day. */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Today as YYYY-MM-DD in the person's own time zone. */
export function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
