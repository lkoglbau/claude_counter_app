import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getSwatch } from '@/theme/palette';
import { SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import type { Counter, Slip } from '@/types/counter';
import { formatHumanDate } from '@/utils/date';
import { buildTimeline } from '@/utils/timeline';

type Props = {
  counter: Counter;
  onPressSlip: (slip: Slip) => void;
};

function daysText(days: number): string {
  return days === 1 ? '1 Tag' : `${days} Tage`;
}

/**
 * Vertical timeline: Start → Ausrutscher 1 → Ausrutscher 2 …, each followed by
 * the streak length until the next event. The last block (until today) is the
 * running streak and is highlighted in the counter's accent color. Tapping a
 * slip opens it for editing / deleting.
 */
export function StreakTimeline({ counter, onPressSlip }: Props) {
  const { colors, scheme } = useTheme();
  const swatch = getSwatch(counter.colorId, scheme);
  const entries = buildTimeline(counter);

  return (
    <View>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        const slipNumber = index; // start is index 0, first slip is 1
        const dotColor = entry.kind === 'start' ? colors.textTertiary : colors.destructive;
        const title = entry.kind === 'start' ? 'Start' : `Ausrutscher ${slipNumber}`;

        const eventRow = (
          <View style={styles.eventText}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>
              {title}
              <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>
                {'  '}
                {formatHumanDate(entry.date)}
              </Text>
            </Text>
            {entry.slip?.note ? (
              <Text style={[styles.note, { color: colors.textSecondary }]}>
                {entry.slip.note}
              </Text>
            ) : null}
          </View>
        );

        return (
          <View key={entry.key} style={styles.block}>
            <View style={styles.rail}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <View
                style={[
                  styles.line,
                  { backgroundColor: entry.running ? swatch.accent : colors.separator },
                ]}
              />
            </View>

            <View style={[styles.content, isLast && styles.contentLast]}>
              {entry.slip ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${title} bearbeiten`}
                  onPress={() => onPressSlip(entry.slip as Slip)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  {eventRow}
                </Pressable>
              ) : (
                eventRow
              )}

              <Text
                style={[
                  entry.running ? styles.daysRunning : styles.days,
                  { color: entry.running ? swatch.accent : colors.textSecondary },
                ]}
              >
                {daysText(entry.days)}
                {entry.running ? ' · läuft' : ''}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { flexDirection: 'row', gap: SPACING.lg },
  rail: { alignItems: 'center', width: 12, paddingTop: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, flex: 1, marginTop: SPACING.xs, borderRadius: 1 },
  content: { flex: 1, gap: SPACING.sm, paddingBottom: SPACING.xl },
  contentLast: { paddingBottom: 0 },
  eventText: { gap: 2 },
  eventTitle: { ...TYPOGRAPHY.headline },
  note: { ...TYPOGRAPHY.subhead },
  days: { ...TYPOGRAPHY.subhead },
  daysRunning: { fontSize: 28, fontWeight: '700', letterSpacing: 0.3 },
});
