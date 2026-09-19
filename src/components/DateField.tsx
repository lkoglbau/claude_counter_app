import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { formatHumanDate, fromISODate, toISODate, todayISODate } from '@/utils/date';

type Props = {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (isoDate: string) => void;
  minimumDate?: string; // YYYY-MM-DD
};

export function DateField({ label, value, onChange, minimumDate }: Props) {
  const { colors, scheme } = useTheme();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((v) => !v);
  };

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setOpen(false);
    if (date) onChange(toISODate(date));
  };

  // The community datetimepicker has no web implementation (renders nothing),
  // so on web use the browser's native <input type="date">.
  if (Platform.OS === 'web') {
    return (
      <View
        style={[styles.row, { backgroundColor: colors.fieldBackground }]}
        accessibilityLabel={`${label}: ${formatHumanDate(value)}`}
      >
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {createElement('input', {
          type: 'date',
          value,
          min: minimumDate,
          max: todayISODate(),
          onChange: (e: { target: { value: string } }) => {
            // Empty (cleared) or a half-typed year like 0002: ignore until complete.
            const next = e.target.value;
            if (next && next >= '1900-01-01') onChange(next);
          },
          style: {
            font: 'inherit',
            fontWeight: 600,
            fontSize: 17,
            color: colors.text,
            colorScheme: scheme,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            textAlign: 'right',
            cursor: 'pointer',
          },
        })}
      </View>
    );
  }

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatHumanDate(value)}`}
        onPress={toggle}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.fieldBackground, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: open ? colors.tint : colors.text }]}>
          {formatHumanDate(value)}
        </Text>
      </Pressable>

      {open && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={fromISODate(value)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={new Date()}
            minimumDate={minimumDate ? fromISODate(minimumDate) : undefined}
            onChange={handleChange}
            themeVariant={scheme}
            accentColor={colors.tint}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...TYPOGRAPHY.body,
  },
  value: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
  },
  pickerWrap: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
});
