import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CounterForm } from '@/components/CounterForm';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SlipSheet } from '@/components/SlipSheet';
import { StreakTimeline } from '@/components/StreakTimeline';
import { useCounters } from '@/hooks/useCounters';
import { SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { CounterDraft, Slip, SlipDraft } from '@/types/counter';
import { confirmDestructive, showError } from '@/utils/confirm';

export default function EditCounterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCounter, updateCounter, removeCounter, addSlip, updateSlip, removeSlip } =
    useCounters();

  const counter = getCounter(id);

  // `false` = closed, `null` = adding, Slip = editing.
  const [sheet, setSheet] = useState<Slip | null | false>(false);
  // Set while our own delete is in flight, so the "counter vanished" effect
  // below doesn't navigate back a second time.
  const leaving = useRef(false);

  // Counter vanished (deleted elsewhere) — close the modal.
  useEffect(() => {
    if (!counter && !leaving.current) router.back();
  }, [counter, router]);

  if (!counter) return null;

  const handleSubmit = (draft: CounterDraft) => {
    updateCounter(counter.id, draft);
    Haptics.selectionAsync();
    router.back();
  };

  const handleDelete = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const confirmed = await confirmDestructive({
      title: 'Counter löschen?',
      message: `„${counter.name}" wird dauerhaft entfernt.`,
    });
    if (!confirmed) return;

    leaving.current = true;
    try {
      // Same store call as swipe-to-delete. Resolves only after Supabase
      // confirmed the delete, so we navigate back exactly once, afterwards.
      await removeCounter(counter.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      leaving.current = false;
      console.error('Failed to delete counter', error);
      showError('Löschen fehlgeschlagen', error instanceof Error ? error.message : String(error));
    }
  };

  const handleSaveSlip = async (draft: SlipDraft) => {
    if (sheet) await updateSlip(counter.id, sheet.id, draft);
    else await addSlip(counter.id, draft);
    Haptics.selectionAsync();
    setSheet(false);
  };

  const handleDeleteSlip = async () => {
    if (!sheet) return;
    const confirmed = await confirmDestructive({
      title: 'Ausrutscher löschen?',
      message: 'Die Streak davor läuft dadurch wieder weiter.',
    });
    if (!confirmed) return;
    try {
      await removeSlip(counter.id, sheet.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSheet(false);
    } catch (error) {
      showError('Löschen fehlgeschlagen', error instanceof Error ? error.message : String(error));
    }
  };

  const header = (
    <View style={styles.timelineSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Verlauf</Text>
      <StreakTimeline counter={counter} onPressSlip={setSheet} />
      <PrimaryButton
        label="Ausrutscher hinzufügen"
        variant="secondary"
        icon="plus"
        onPress={() => setSheet(null)}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CounterForm
        header={header}
        initialValue={{
          name: counter.name,
          startDate: counter.startDate,
          colorId: counter.colorId,
        }}
        submitLabel="Änderungen speichern"
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
      <SlipSheet
        visible={sheet !== false}
        counter={counter}
        slip={sheet || null}
        onClose={() => setSheet(false)}
        onSave={handleSaveSlip}
        onDelete={handleDeleteSlip}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  timelineSection: { gap: SPACING.lg },
  sectionTitle: { ...TYPOGRAPHY.title },
});
