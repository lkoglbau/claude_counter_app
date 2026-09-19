import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { formatHumanDate, fromISODate, toISODate } from '@/utils/date';

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
