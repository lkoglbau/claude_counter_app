import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type Props = {
  label: string;
  onPress: () => void;
  /**
   * primary: filled pill (the one main action per screen)
   * secondary: outlined pill for supporting actions
   * destructive: muted red on a soft wash - deliberately calm, the confirm
   *   dialog is what guards against accidents
   */
  variant?: 'primary' | 'secondary' | 'destructive';
  icon?: ComponentProps<typeof Feather>['name'];
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
}: Props) {
  const { colors } = useTheme();
  const inactive = disabled || loading;

  const look = {
    primary: {
      backgroundColor: inactive ? colors.authButtonDisabled : colors.tint,
      borderColor: 'transparent',
      color: inactive ? colors.textSecondary : colors.onTint,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: colors.fieldBorder,
      color: colors.text,
    },
    destructive: {
      backgroundColor: colors.destructiveSoft,
      borderColor: 'transparent',
      color: colors.destructive,
    },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: look.backgroundColor,
          borderColor: look.borderColor,
          opacity: variant !== 'primary' && disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.color} />
      ) : (
        <>
          {icon && <Feather name={icon} size={18} color={look.color} />}
          <Text style={[styles.label, { color: look.color }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
