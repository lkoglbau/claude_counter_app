import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Counter, CounterDraft, Slip, SlipDraft } from '@/types/counter';
import { createId } from '@/utils/id';
import {
  deleteCounterRow,
  deleteSlipRow,
  fetchCounters,
  insertCounter,
  insertSlip,
  updateCounterRow,
  updateSlipRow,
} from './countersRepo';

type CountersContextValue = {
  counters: Counter[];
  getCounter: (id: string) => Counter | undefined;
  addCounter: (draft: CounterDraft) => Counter;
  updateCounter: (id: string, draft: CounterDraft) => void;
  /** Resolves once the row is really gone in Supabase; rejects otherwise. */
  removeCounter: (id: string) => Promise<void>;
  addSlip: (counterId: string, draft: SlipDraft) => Promise<void>;
  updateSlip: (counterId: string, slipId: string, draft: SlipDraft) => Promise<void>;
  removeSlip: (counterId: string, slipId: string) => Promise<void>;
};

const CountersContext = createContext<CountersContextValue | null>(null);

function sortSlips(slips: Slip[]): Slip[] {
  return [...slips].sort((a, b) => a.date.localeCompare(b.date));
}

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
      slips: [],
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

  // Persist first, then drop from local state: the caller navigates only after
  // the delete really happened, and a failure is surfaced instead of swallowed.
  const removeCounter = useCallback(async (id: string) => {
    await deleteCounterRow(id);
    setCounters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const patchSlips = useCallback((counterId: string, fn: (slips: Slip[]) => Slip[]) => {
    setCounters((prev) =>
      prev.map((c) => (c.id === counterId ? { ...c, slips: sortSlips(fn(c.slips)) } : c)),
    );
  }, []);

  const addSlip = useCallback(
    async (counterId: string, draft: SlipDraft) => {
      const slip: Slip = {
        id: createId(),
        date: draft.date,
        note: draft.note?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      await insertSlip(counterId, slip);
      patchSlips(counterId, (slips) => [...slips, slip]);
    },
    [patchSlips],
  );

  const updateSlip = useCallback(
    async (counterId: string, slipId: string, draft: SlipDraft) => {
      const note = draft.note?.trim() || undefined;
      await updateSlipRow(slipId, { date: draft.date, note });
      patchSlips(counterId, (slips) =>
        slips.map((s) => (s.id === slipId ? { ...s, date: draft.date, note } : s)),
      );
    },
    [patchSlips],
  );

  const removeSlip = useCallback(
    async (counterId: string, slipId: string) => {
      await deleteSlipRow(slipId);
      patchSlips(counterId, (slips) => slips.filter((s) => s.id !== slipId));
    },
    [patchSlips],
  );

  const value = useMemo<CountersContextValue>(
    () => ({
      counters,
      getCounter,
      addCounter,
      updateCounter,
      removeCounter,
      addSlip,
      updateSlip,
      removeSlip,
    }),
    [counters, getCounter, addCounter, updateCounter, removeCounter, addSlip, updateSlip, removeSlip],
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
