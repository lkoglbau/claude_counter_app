import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getSwatch } from '@/theme/palette';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Counter } from '@/types/counter';
import { formatHumanDate } from '@/utils/date';
import { useDaysSince } from '@/hooks/useDaysSince';
import { lastEventDate } from '@/utils/timeline';

type Props = {
  counter: Counter;
  onPress: () => void;
};

export function CounterCard({ counter, onPress }: Props) {
  const { colors, scheme } = useTheme();
  const swatch = getSwatch(counter.colorId, scheme);
  // Streak runs from the last slip, or from the start date if there is none.
  const since = lastEventDate(counter);
  const days = useDaysSince(since);
  const displayDays = Math.max(days, 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${counter.name}, seit ${displayDays} Tagen`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
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
          {days <= 0 ? 'seit heute' : `seit ${formatHumanDate(since)}`}
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
    // Concentric with the home screen's group card (28 radius, 12 padding).
    borderRadius: RADIUS.md,
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
