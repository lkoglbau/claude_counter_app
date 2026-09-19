import { supabase } from '@/services/supabaseClient';
import { isValidCounter, type Counter, type Slip } from '@/types/counter';

/**
 * Persistence boundary. The rest of the app never touches Supabase directly, so
 * swapping the backend later is a change confined to this file.
 */
const TABLE = 'counters';
const SLIPS_TABLE = 'slips';

type CounterRow = {
  id: string;
  name: string;
  start_date: string;
  color_id: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
};

type SlipRow = {
  id: string;
  counter_id: string;
  slip_date: string;
  note: string | null;
  created_at: string;
};

function rowToSlip(row: SlipRow): Slip {
  return {
    id: row.id,
    date: row.slip_date,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

function rowToCounter(row: CounterRow, slips: Slip[]): Counter | null {
  const counter: Counter = {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    colorId: row.color_id as Counter['colorId'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    slips,
  };
  return isValidCounter(counter) ? counter : null;
}

export async function fetchCounters(): Promise<Counter[]> {
  const [counters, slips] = await Promise.all([
    supabase.from(TABLE).select('*'),
    supabase.from(SLIPS_TABLE).select('*').order('slip_date', { ascending: true }),
  ]);
  if (counters.error) throw counters.error;
  if (slips.error) throw slips.error;

  const slipsByCounter = new Map<string, Slip[]>();
  for (const row of slips.data as SlipRow[]) {
    const list = slipsByCounter.get(row.counter_id) ?? [];
    list.push(rowToSlip(row));
    slipsByCounter.set(row.counter_id, list);
  }
  return (counters.data as CounterRow[])
    .map((row) => rowToCounter(row, slipsByCounter.get(row.id) ?? []))
    .filter((c): c is Counter => c !== null);
}

export async function insertCounter(counter: Counter): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('Not authenticated');

  const { error } = await supabase.from(TABLE).insert({
    id: counter.id,
    name: counter.name,
    start_date: counter.startDate,
    color_id: counter.colorId,
    created_at: counter.createdAt,
    updated_at: counter.updatedAt,
    user_id: userData.user.id,
  });
  if (error) throw error;
}

/**
 * One-time migration helper: assigns any counter that predates per-user data
 * (user_id still null, e.g. the original seed data) to whoever signs in first.
 * A no-op once every row has an owner.
 */
export async function claimOrphanCounters(): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return;

  const { error } = await supabase
    .from(TABLE)
    .update({ user_id: userData.user.id })
    .is('user_id', null);
  if (error) console.error('Failed to claim orphaned counters', error);
}

export async function updateCounterRow(
  id: string,
  updates: Pick<Counter, 'name' | 'startDate' | 'colorId' | 'updatedAt'>,
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .update({
      name: updates.name,
      start_date: updates.startDate,
      color_id: updates.colorId,
      updated_at: updates.updatedAt,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCounterRow(id: string): Promise<void> {
  // RLS turns a delete it forbids into a silent "0 rows affected" — not an
  // error. Ask for the deleted rows back so a no-op can't pass for success.
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error('Counter konnte nicht gelöscht werden (keine Berechtigung oder nicht gefunden).');
  }
}

export async function insertSlip(counterId: string, slip: Slip): Promise<void> {
  const { error } = await supabase.from(SLIPS_TABLE).insert({
    id: slip.id,
    counter_id: counterId,
    slip_date: slip.date,
    note: slip.note ?? null,
    created_at: slip.createdAt,
  });
  if (error) throw error;
}

export async function updateSlipRow(
  id: string,
  updates: Pick<Slip, 'date' | 'note'>,
): Promise<void> {
  const { data, error } = await supabase
    .from(SLIPS_TABLE)
    .update({ slip_date: updates.date, note: updates.note ?? null })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Ausrutscher konnte nicht gespeichert werden.');
}

export async function deleteSlipRow(id: string): Promise<void> {
  const { data, error } = await supabase.from(SLIPS_TABLE).delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Ausrutscher konnte nicht gelöscht werden.');
}
