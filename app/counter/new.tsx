import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { CounterForm } from '@/components/CounterForm';
import { useCounters } from '@/hooks/useCounters';
import { useTheme } from '@/theme/useTheme';
import type { CounterDraft } from '@/types/counter';

export default function NewCounterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addCounter } = useCounters();

  const handleSubmit = (draft: CounterDraft) => {
    addCounter(draft);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CounterForm submitLabel="Counter anlegen" onSubmit={handleSubmit} />
    </View>
  );
}
