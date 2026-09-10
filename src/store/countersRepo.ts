import Storage from 'expo-sqlite/kv-store';

import { isValidCounter, type Counter } from '@/types/counter';

/**
 * Persistence boundary. The rest of the app never touches storage directly, so
 * swapping `expo-sqlite/kv-store` for MMKV later is a change confined to this
 * file.
 *
 * The whole dataset is a single JSON array under one key — it is tiny (a handful
 * of counters) and always read/written as a unit.
 */
const STORAGE_KEY = 'counters/v1';

export function loadCounters(): Counter[] {
  try {
    const raw = Storage.getItemSync(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop anything that doesn't match the current shape rather than crash.
    return parsed.filter(isValidCounter);
  } catch {
    return [];
  }
}

export function saveCounters(counters: Counter[]): void {
  Storage.setItemSync(STORAGE_KEY, JSON.stringify(counters));
}
