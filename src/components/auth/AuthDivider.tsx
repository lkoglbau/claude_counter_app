import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

/** "——• label •——" separator above the social buttons. */
export function AuthDivider({ label }: { label: string }) {
  const { colors } = useTheme();
  const line = { backgroundColor: colors.authBorder };

  return (
    <View style={styles.row}>
      <View style={[styles.line, line]} />
      <View style={[styles.dot, line]} />
      <Text style={[styles.label, { color: colors.authTextSecondary }]}>{label}</Text>
      <View style={[styles.dot, line]} />
      <View style={[styles.line, line]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  label: {
    fontSize: 12,
    marginHorizontal: 12,
  },
});
