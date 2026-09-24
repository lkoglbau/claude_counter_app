import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type Props = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

/** Outlined pill for third-party sign-in. Flexes to share a row with siblings. */
export function SocialButton({ label, icon, onPress, loading = false, disabled = false }: Props) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mit ${label} fortfahren`}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        { borderColor: colors.authBorder, opacity: pressed || disabled ? 0.7 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.authTextPrimary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: colors.authTextPrimary }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
});
