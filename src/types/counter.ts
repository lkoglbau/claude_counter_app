import { COLOR_IDS, type CounterColorId } from '@/theme/palette';

/**
 * The single domain entity of the app. Persisted locally as JSON.
 *
 * - `startDate` is stored as a plain calendar date (`YYYY-MM-DD`), never with a
 *   time component, so day math is immune to timezone / DST edges.
 * - `colorId` references the curated palette rather than a raw hex value, which
 *   keeps stored data portable if the palette is re-tuned and lets each color
 *   carry its own light/dark variants.
 */
export type Counter = {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  colorId: CounterColorId;
  createdAt: string; // ISO-8601 datetime
  updatedAt: string; // ISO-8601 datetime
};

/** Fields the user actually edits in the create / edit form. */
export type CounterDraft = {
  name: string;
  startDate: string; // YYYY-MM-DD
  colorId: CounterColorId;
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function isColorId(value: unknown): value is CounterColorId {
  return typeof value === 'string' && (COLOR_IDS as readonly string[]).includes(value);
}

/** Runtime guard used when re-hydrating data from storage. */
export function isValidCounter(value: unknown): value is Counter {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.startDate === 'string' &&
    DATE_ONLY.test(c.startDate) &&
    isColorId(c.colorId) &&
    typeof c.createdAt === 'string' &&
    typeof c.updatedAt === 'string'
  );
}
