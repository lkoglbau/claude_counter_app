import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function AuthCheckbox({ label, checked, onChange }: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      hitSlop={8}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          checked
            ? { backgroundColor: colors.authTextPrimary, borderColor: colors.authTextPrimary }
            : { borderColor: colors.authTextSecondary },
        ]}
      >
        {checked && <Feather name="check" size={12} color={colors.authButtonText} />}
      </View>
      <Text style={[styles.label, { color: colors.authTextSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
  },
});
