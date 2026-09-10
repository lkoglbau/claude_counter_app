import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Counter, CounterDraft } from '@/types/counter';
import { createId } from '@/utils/id';
import { loadCounters, saveCounters } from './countersRepo';

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
  // Synchronous hydration from SQLite-backed storage — no loading flash.
  const [counters, setCounters] = useState<Counter[]>(() => sortCounters(loadCounters()));

  // Single choke point: update React state and persist in the same step.
  const commit = useCallback((next: Counter[]) => {
    const sorted = sortCounters(next);
    setCounters(sorted);
    saveCounters(sorted);
  }, []);

  const getCounter = useCallback(
    (id: string) => counters.find((c) => c.id === id),
    [counters],
  );

  const addCounter = useCallback(
    (draft: CounterDraft): Counter => {
      const now = new Date().toISOString();
      const counter: Counter = {
        id: createId(),
        name: draft.name.trim(),
        startDate: draft.startDate,
        colorId: draft.colorId,
        createdAt: now,
        updatedAt: now,
      };
      commit([counter, ...counters]);
      return counter;
    },
    [counters, commit],
  );

  const updateCounter = useCallback(
    (id: string, draft: CounterDraft) => {
      commit(
        counters.map((c) =>
          c.id === id
            ? {
                ...c,
                name: draft.name.trim(),
                startDate: draft.startDate,
                colorId: draft.colorId,
                updatedAt: new Date().toISOString(),
              }
            : c,
        ),
      );
    },
    [counters, commit],
  );

  const removeCounter = useCallback(
    (id: string) => {
      commit(counters.filter((c) => c.id !== id));
    },
    [counters, commit],
  );

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
