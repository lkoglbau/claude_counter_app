import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PALETTE_LIST, type CounterColorId } from '@/theme/palette';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = {
  label: string;
  value: CounterColorId;
  onChange: (colorId: CounterColorId) => void;
};

const SWATCH = 44;

export function ColorPicker({ label, value, onChange }: Props) {
  const { colors, scheme } = useTheme();

  return (
    <View>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={styles.grid}>
        {PALETTE_LIST.map((entry) => {
          const swatch = entry[scheme];
          const selected = entry.id === value;
          return (
            <Pressable
              key={entry.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={entry.label}
              onPress={() => onChange(entry.id)}
              style={({ pressed }) => [styles.swatchHit, { opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                style={[
                  styles.swatch,
                  {
                    backgroundColor: swatch.tint,
                    borderColor: selected ? swatch.accent : swatch.border,
                    borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: swatch.accent }]} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  swatchHit: {
    borderRadius: RADIUS.pill,
  },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: RADIUS.pill,
  },
});
