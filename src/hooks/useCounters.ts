import { useCountersContext } from '@/store/CountersProvider';

/**
 * Thin re-export of the counters context so screens depend on a hook rather than
 * the provider module directly.
 */
export function useCounters() {
  return useCountersContext();
}
