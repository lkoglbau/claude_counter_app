import { StyleSheet, Text, View } from 'react-native';

import { SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export function EmptyState() {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Noch keine Counter</Text>
      <Text style={[styles.body, { color: colors.textSecondary }]}>
        Tippe auf +, um deinen ersten Counter anzulegen und die Tage seit dem
        Aufhören zu zählen.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxxl,
    gap: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.title,
    textAlign: 'center',
  },
  body: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
    lineHeight: 22,
  },
});
