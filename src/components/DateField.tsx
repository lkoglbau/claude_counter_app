import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { createElement, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { formatHumanDate, fromISODate, toISODate, todayISODate } from '@/utils/date';

const WEB_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

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
        style={[
          styles.row,
          { backgroundColor: colors.fieldBackground, borderColor: colors.fieldBorder },
        ]}
        accessibilityLabel={`${label}: ${formatHumanDate(value)}`}
      >
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
            // Same face as the rest of the app (react-native-web's default
            // stack) — an <input> would otherwise fall back to the browser font.
            fontFamily: WEB_FONT,
            fontSize: TYPOGRAPHY.body.fontSize,
            fontWeight: 600,
            letterSpacing: TYPOGRAPHY.body.letterSpacing,
            color: colors.text,
            colorScheme: scheme,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
            textAlign: 'left',
            cursor: 'pointer',
          },
        })}
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
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
          {
            backgroundColor: colors.fieldBackground,
            borderColor: open ? colors.controlAccent : colors.fieldBorder,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[styles.value, { color: colors.text }]}>
          {formatHumanDate(value)}
        </Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
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
            // tint is near-white/black and would hide the selected day's number.
            accentColor={colors.controlAccent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    borderRadius: RADIUS.field,
    borderWidth: 1,
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
