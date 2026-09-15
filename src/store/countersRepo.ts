import { supabase } from '@/services/supabaseClient';
import { isValidCounter, type Counter } from '@/types/counter';

/**
 * Persistence boundary. The rest of the app never touches Supabase directly, so
 * swapping the backend later is a change confined to this file.
 */
const TABLE = 'counters';

type CounterRow = {
  id: string;
  name: string;
  start_date: string;
  color_id: string;
  created_at: string;
  updated_at: string;
};

function rowToCounter(row: CounterRow): Counter | null {
  const counter: Counter = {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    colorId: row.color_id as Counter['colorId'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  return isValidCounter(counter) ? counter : null;
}

export async function fetchCounters(): Promise<Counter[]> {
  const { data, error } = await supabase.from(TABLE).select('*');
  if (error) throw error;
  return (data as CounterRow[]).map(rowToCounter).filter((c): c is Counter => c !== null);
}

export async function insertCounter(counter: Counter): Promise<void> {
  const { error } = await supabase.from(TABLE).insert({
    id: counter.id,
    name: counter.name,
    start_date: counter.startDate,
    color_id: counter.colorId,
    created_at: counter.createdAt,
    updated_at: counter.updatedAt,
  });
  if (error) throw error;
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
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
