import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, View } from 'react-native';

import { CounterForm } from '@/components/CounterForm';
import { useCounters } from '@/hooks/useCounters';
import { useTheme } from '@/theme/useTheme';
import type { CounterDraft } from '@/types/counter';

export default function EditCounterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCounter, updateCounter, removeCounter } = useCounters();

  const counter = getCounter(id);

  // Counter vanished (deleted elsewhere) — close the modal.
  useEffect(() => {
    if (!counter) router.back();
  }, [counter, router]);

  if (!counter) return null;

  const handleSubmit = (draft: CounterDraft) => {
    updateCounter(counter.id, draft);
    Haptics.selectionAsync();
    router.back();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Counter löschen?',
      `„${counter.name}" wird dauerhaft entfernt.`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            removeCounter(counter.id);
            router.back();
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CounterForm
        initialValue={{
          name: counter.name,
          startDate: counter.startDate,
          colorId: counter.colorId,
        }}
        submitLabel="Änderungen speichern"
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </View>
  );
}
