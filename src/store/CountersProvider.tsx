import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Counter, CounterDraft } from '@/types/counter';
import { createId } from '@/utils/id';
import {
  deleteCounterRow,
  fetchCounters,
  insertCounter,
  updateCounterRow,
} from './countersRepo';

type CountersContextValue = {
  counters: Counter[];
  getCounter: (id: string) => Counter | undefined;
  addCounter: (draft: CounterDraft) => Counter;
  updateCounter: (id: string, draft: CounterDraft) => void;
  removeCounter: (id: string) => void;
};

const CountersContext = createContext<CountersContextValue | null>(null);

/** Newest first, so a freshly added counter appears at the top of the list. */
function sortCounters(list: Counter[]): Counter[] {
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function CountersProvider({ children }: { children: ReactNode }) {
  const [counters, setCounters] = useState<Counter[]>([]);

  // Initial hydration from Supabase — async, so the list starts empty for one frame.
  useEffect(() => {
    fetchCounters()
      .then((loaded) => setCounters(sortCounters(loaded)))
      .catch((error) => console.error('Failed to load counters from Supabase', error));
  }, []);

  const getCounter = useCallback(
    (id: string) => counters.find((c) => c.id === id),
    [counters],
  );

  // Optimistic local update, persisted to Supabase in the background.
  const addCounter = useCallback((draft: CounterDraft): Counter => {
    const now = new Date().toISOString();
    const counter: Counter = {
      id: createId(),
      name: draft.name.trim(),
      startDate: draft.startDate,
      colorId: draft.colorId,
      createdAt: now,
      updatedAt: now,
    };
    setCounters((prev) => sortCounters([counter, ...prev]));
    insertCounter(counter).catch((error) =>
      console.error('Failed to save counter to Supabase', error),
    );
    return counter;
  }, []);

  const updateCounter = useCallback((id: string, draft: CounterDraft) => {
    const updatedAt = new Date().toISOString();
    const name = draft.name.trim();
    setCounters((prev) =>
      sortCounters(
        prev.map((c) =>
          c.id === id ? { ...c, name, startDate: draft.startDate, colorId: draft.colorId, updatedAt } : c,
        ),
      ),
    );
    updateCounterRow(id, { name, startDate: draft.startDate, colorId: draft.colorId, updatedAt }).catch(
      (error) => console.error('Failed to update counter in Supabase', error),
    );
  }, []);

  const removeCounter = useCallback((id: string) => {
    setCounters((prev) => prev.filter((c) => c.id !== id));
    deleteCounterRow(id).catch((error) =>
      console.error('Failed to delete counter in Supabase', error),
    );
  }, []);

  const value = useMemo<CountersContextValue>(
    () => ({ counters, getCounter, addCounter, updateCounter, removeCounter }),
    [counters, getCounter, addCounter, updateCounter, removeCounter],
  );

  return <CountersContext.Provider value={value}>{children}</CountersContext.Provider>;
}

export function useCountersContext(): CountersContextValue {
  const ctx = useContext(CountersContext);
  if (!ctx) {
    throw new Error('useCountersContext must be used within a CountersProvider');
  }
  return ctx;
}
