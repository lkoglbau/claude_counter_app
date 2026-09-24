import Feather from '@expo/vector-icons/Feather';
import { forwardRef, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type Props = Omit<TextInputProps, 'style' | 'placeholderTextColor' | 'secureTextEntry'> & {
  icon: ComponentProps<typeof Feather>['name'];
  /** Adds the eye toggle and hides the value by default. */
  password?: boolean;
  error?: string | null;
};

export const AuthTextField = forwardRef<TextInput, Props>(function AuthTextField(
  { icon, password = false, error, onFocus, onBlur, ...inputProps },
  ref,
) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error
    ? colors.authError
    : focused
      ? colors.authBorderFocus
      : colors.authBorder;

  return (
    <View>
      <View style={[styles.field, { borderColor, backgroundColor: colors.authInputBg }]}>
        <Feather name={icon} size={18} color={colors.authTextSecondary} />
        <TextInput
          ref={ref}
          {...inputProps}
          secureTextEntry={password && !revealed}
          placeholderTextColor={colors.authTextSecondary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: colors.authTextPrimary }]}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Passwort verbergen' : 'Passwort anzeigen'}
            onPress={() => setRevealed((r) => !r)}
            hitSlop={13} // 18pt icon + 2×13 ≈ 44pt touch target
          >
            <Feather
              name={revealed ? 'eye' : 'eye-off'}
              size={18}
              color={colors.authTextSecondary}
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={[styles.error, { color: colors.authError }]}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    // Removes the browser's focus ring; the border already signals focus.
    outlineStyle: 'none',
  } as object,
  error: {
    fontSize: 12,
    marginTop: 6,
  },
});
