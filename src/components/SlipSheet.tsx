import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DateField } from '@/components/DateField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Counter, Slip, SlipDraft } from '@/types/counter';
import { todayISODate } from '@/utils/date';
import { validateSlipDate } from '@/utils/timeline';

const NOTE_MAX = 60;

type Props = {
  visible: boolean;
  counter: Counter;
  /** Slip being edited; `null` when adding a new one. */
  slip: Slip | null;
  onClose: () => void;
  onSave: (draft: SlipDraft) => Promise<void>;
  onDelete?: () => void;
};

export function SlipSheet({ visible, counter, slip, onClose, onSave, onDelete }: Props) {
  const { colors } = useTheme();
  const [date, setDate] = useState(todayISODate());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset the fields every time the sheet opens.
  useEffect(() => {
    if (!visible) return;
    setDate(slip?.date ?? todayISODate());
    setNote(slip?.note ?? '');
    setSubmitError(null);
    setSaving(false);
  }, [visible, slip]);

  const error = validateSlipDate(counter, date, slip?.id);

  const handleSave = async () => {
    if (error || saving) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await onSave({ date, note: note.trim() || undefined });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen.');
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={styles.bar}>
          <Text style={[styles.title, { color: colors.text }]}>
            {slip ? 'Ausrutscher bearbeiten' : 'Ausrutscher hinzufügen'}
          </Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12}>
            <Text style={[styles.close, { color: colors.tint }]}>Abbrechen</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.field}>
              <DateField
                label="Datum"
                value={date}
                onChange={setDate}
                minimumDate={counter.startDate}
              />
              {error && <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Name / Grund (optional)
              </Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="z. B. Firmenfeier"
                placeholderTextColor={colors.textTertiary}
                maxLength={NOTE_MAX}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                style={[
                  styles.input,
                  { backgroundColor: colors.fieldBackground, color: colors.text },
                ]}
              />
            </View>

            {submitError && (
              <Text style={[styles.error, { color: colors.destructive }]}>{submitError}</Text>
            )}

            <View style={styles.actions}>
              <PrimaryButton
                label={slip ? 'Änderungen speichern' : 'Ausrutscher speichern'}
                onPress={handleSave}
                disabled={!!error}
                loading={saving}
              />
              {slip && onDelete && (
                <PrimaryButton
                  label="Ausrutscher löschen"
                  variant="destructive"
                  onPress={onDelete}
                />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: { flex: 1 },
  bar: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...TYPOGRAPHY.headline },
  close: { ...TYPOGRAPHY.body },
  content: { padding: SPACING.xl, gap: SPACING.xxl },
  field: { gap: SPACING.md },
  label: { ...TYPOGRAPHY.body },
  input: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    ...TYPOGRAPHY.body,
  },
  error: { ...TYPOGRAPHY.footnote },
  actions: { gap: SPACING.md },
});
