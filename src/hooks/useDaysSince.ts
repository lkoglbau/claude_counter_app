import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { daysSince } from '@/utils/date';

/**
 * Live day count for a start date. Recomputes when:
 *  - the component mounts,
 *  - the screen regains focus,
 *  - the app returns to the foreground (crossing midnight while backgrounded).
 *
 * No interval timer is needed for v1 — those three moments cover every way the
 * number can change while the user is looking at it.
 */
export function useDaysSince(startDate: string): number {
  const [days, setDays] = useState(() => daysSince(startDate));

  const recompute = useCallback(() => {
    setDays(daysSince(startDate));
  }, [startDate]);

  useEffect(recompute, [recompute]);

  useFocusEffect(recompute);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recompute();
    });
    return () => sub.remove();
  }, [recompute]);

  return days;
}
