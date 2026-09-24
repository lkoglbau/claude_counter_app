import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const BULLETS = [
  'Lege für jede Gewohnheit einen eigenen Counter an.',
  'Der Tage-Zähler läuft automatisch – seit dem Startdatum oder dem letzten Ausrutscher.',
  'Ausrutscher passiert? Trag ihn ein, der Zähler startet neu – deine bisherige Streak bleibt in der Historie sichtbar.',
  'Gib jedem Counter seine eigene Farbe, damit du ihn auf einen Blick erkennst.',
];

export function OnboardingInfoModal({ visible, onClose }: Props) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={styles.bar}>
          <Text style={[styles.title, { color: colors.text }]}>Willkommen</Text>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={12}>
            <Text style={[styles.close, { color: colors.tint }]}>Schließen</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.headline, { color: colors.text }]}>
            So funktioniert Days Since
          </Text>

          <View style={styles.bullets}>
            {BULLETS.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <View style={[styles.dot, { backgroundColor: colors.tint }]} />
                <Text style={[styles.bulletText, { color: colors.textSecondary }]}>
                  {bullet}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.actions}>
          <PrimaryButton label="Los geht's" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  content: { padding: SPACING.xl, gap: SPACING.xl },
  headline: { ...TYPOGRAPHY.title },
  bullets: { gap: SPACING.lg },
  bulletRow: { flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start' },
  dot: {
    width: 6,
    height: 6,
    borderRadius: RADIUS.pill,
    marginTop: 9,
  },
  bulletText: { ...TYPOGRAPHY.body, flex: 1, lineHeight: 22 },
  actions: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl },
});
