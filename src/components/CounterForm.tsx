import { useMemo, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ColorPicker } from '@/components/ColorPicker';
import { DateField } from '@/components/DateField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { DEFAULT_COLOR_ID } from '@/theme/palette';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { CounterDraft } from '@/types/counter';
import { todayISODate } from '@/utils/date';

const NAME_MAX = 40;

type Props = {
  initialValue?: CounterDraft;
  submitLabel: string;
  onSubmit: (draft: CounterDraft) => void;
  onDelete?: () => void;
  /** Rendered above the fields, e.g. the streak timeline in the detail view. */
  header?: ReactNode;
};

export function CounterForm({ initialValue, submitLabel, onSubmit, onDelete, header }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(initialValue?.name ?? '');
  const [startDate, setStartDate] = useState(initialValue?.startDate ?? todayISODate());
  const [colorId, setColorId] = useState(initialValue?.colorId ?? DEFAULT_COLOR_ID);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ name: trimmedName, startDate, colorId });
  };

  const contentStyle = useMemo(
    () => [styles.content, { paddingBottom: insets.bottom + SPACING.xl }],
    [insets.bottom],
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {header}

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="z. B. Alkohol"
            placeholderTextColor={colors.textTertiary}
            maxLength={NAME_MAX}
            autoFocus={!initialValue}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={[
              styles.input,
              {
                backgroundColor: colors.fieldBackground,
                borderColor: colors.fieldBorder,
                color: colors.text,
              },
            ]}
          />
        </View>

        <View style={styles.field}>
          <DateField label="Startdatum" value={startDate} onChange={setStartDate} />
        </View>

        <View style={styles.field}>
          <ColorPicker label="Farbe" value={colorId} onChange={setColorId} />
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label={submitLabel}
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
          {onDelete && (
            <PrimaryButton
              label="Counter löschen"
              variant="destructive"
              icon="trash-2"
              onPress={onDelete}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
    gap: SPACING.xxl,
  },
  field: {
    gap: SPACING.sm,
  },
  label: {
    ...TYPOGRAPHY.label,
  },
  input: {
    minHeight: 52,
    borderRadius: RADIUS.field,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    ...TYPOGRAPHY.body,
  },
  actions: {
    gap: SPACING.md,
  },
});
