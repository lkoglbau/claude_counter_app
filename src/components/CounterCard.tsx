import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getSwatch } from '@/theme/palette';
import { CARD_SHADOW, RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Counter } from '@/types/counter';
import { formatHumanDate } from '@/utils/date';
import { useDaysSince } from '@/hooks/useDaysSince';

type Props = {
  counter: Counter;
  onPress: () => void;
};

export function CounterCard({ counter, onPress }: Props) {
  const { colors, scheme } = useTheme();
  const swatch = getSwatch(counter.colorId, scheme);
  const days = useDaysSince(counter.startDate);
  const displayDays = Math.max(days, 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${counter.name}, seit ${displayDays} Tagen`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        CARD_SHADOW,
        {
          backgroundColor: swatch.tint,
          borderColor: swatch.border,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View style={styles.textCol}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
          {counter.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {days <= 0 ? 'seit heute' : `seit ${formatHumanDate(counter.startDate)}`}
        </Text>
      </View>

      <View style={styles.countCol}>
        <Text style={[styles.count, { color: swatch.accent }]}>{displayDays}</Text>
        <Text style={[styles.unit, { color: swatch.accent }]}>
          {displayDays === 1 ? 'Tag' : 'Tage'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  textCol: {
    flex: 1,
    gap: SPACING.xs,
  },
  name: {
    ...TYPOGRAPHY.title,
  },
  subtitle: {
    ...TYPOGRAPHY.footnote,
  },
  countCol: {
    alignItems: 'center',
    minWidth: 64,
  },
  count: {
    ...TYPOGRAPHY.counter,
  },
  unit: {
    ...TYPOGRAPHY.footnote,
    fontWeight: '600',
    marginTop: -SPACING.xs,
  },
});
