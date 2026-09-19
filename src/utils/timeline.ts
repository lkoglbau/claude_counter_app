import { differenceInCalendarDays } from 'date-fns';

import type { Counter, Slip } from '@/types/counter';
import { fromISODate, todayISODate } from './date';

/**
 * Streak math for a counter with slips. Everything goes through
 * `differenceInCalendarDays` (via `fromISODate`), the same calendar-day logic
 * as the plain day count in `date.ts`.
 */

/** Whole calendar days from `from` to `to` (both `YYYY-MM-DD`). */
export function daysBetween(from: string, to: string): number {
  return differenceInCalendarDays(fromISODate(to), fromISODate(from));
}

/** Date the running streak counts from: the last slip, else the start date. */
export function lastEventDate(counter: Pick<Counter, 'startDate' | 'slips'>): string {
  const last = counter.slips[counter.slips.length - 1];
  return last ? last.date : counter.startDate;
}

export type TimelineEntry = {
  key: string;
  kind: 'start' | 'slip';
  date: string;
  slip?: Slip;
  /** Days until the next event, or until today for the running streak. */
  days: number;
  running: boolean;
};

export function buildTimeline(
  counter: Pick<Counter, 'startDate' | 'slips'>,
  today: string = todayISODate(),
): TimelineEntry[] {
  const events = [
    { key: 'start', kind: 'start' as const, date: counter.startDate, slip: undefined },
    ...counter.slips.map((slip) => ({
      key: slip.id,
      kind: 'slip' as const,
      date: slip.date,
      slip,
    })),
  ];
  return events.map((event, i) => {
    const next = events[i + 1];
    return {
      ...event,
      days: Math.max(daysBetween(event.date, next ? next.date : today), 0),
      running: !next,
    };
  });
}

/**
 * Validates a slip date. It must lie strictly after the previous event (start
 * date or previous slip), not on a day that already has a slip, and not in the
 * future. When editing, moving a slip past its neighbours is allowed; the list
 * is re-sorted by date. `editingId` excludes the slip being edited.
 * Returns a German error message, or `null` if valid.
 */
export function validateSlipDate(
  counter: Pick<Counter, 'startDate' | 'slips'>,
  date: string,
  editingId?: string,
  today: string = todayISODate(),
): string | null {
  if (daysBetween(today, date) > 0) return 'Das Datum darf nicht in der Zukunft liegen.';

  const others = counter.slips.filter((s) => s.id !== editingId);
  if (others.some((s) => s.date === date)) {
    return 'An diesem Tag gibt es bereits einen Ausrutscher.';
  }
  const previous = [...others].reverse().find((s) => s.date < date)?.date ?? counter.startDate;
  if (daysBetween(previous, date) <= 0) {
    return previous === counter.startDate
      ? 'Das Datum muss nach dem Startdatum liegen.'
      : 'Das Datum muss nach dem vorherigen Ausrutscher liegen.';
  }
  return null;
}
