import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * All persisted dates are plain `YYYY-MM-DD` strings in the user's local
 * calendar. Day counting is done with `differenceInCalendarDays`, which compares
 * calendar days (not 24h spans), so results never drift across DST or timezone
 * boundaries and never depend on the time of day.
 */

/** `Date` -> local `YYYY-MM-DD`. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Local `YYYY-MM-DD` for today. */
export function todayISODate(): string {
  return toISODate(new Date());
}

/** `YYYY-MM-DD` -> `Date` at local midnight. */
export function fromISODate(isoDate: string): Date {
  return parseISO(isoDate);
}

/**
 * Whole calendar days elapsed since `startDate`. `0` on the start date itself,
 * negative if the start date is in the future (guarded against in the UI).
 */
export function daysSince(startDate: string, now: Date = new Date()): number {
  return differenceInCalendarDays(now, fromISODate(startDate));
}

/** e.g. `seit 40 Tagen`, `seit 1 Tag`, `seit heute`. */
export function formatDaysLabel(days: number): string {
  if (days <= 0) return 'seit heute';
  if (days === 1) return 'seit 1 Tag';
  return `seit ${days} Tagen`;
}

/** Long, localized date for display in the form, e.g. `1. Jänner 2026`. */
export function formatHumanDate(isoDate: string): string {
  return format(fromISODate(isoDate), 'd. MMMM yyyy', { locale: de });
}
