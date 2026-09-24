import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { useCooldown } from '@/hooks/useCooldown';
import { useAuth } from '@/store/AuthProvider';
import { useTheme } from '@/theme/useTheme';
import { validateEmail } from '@/utils/authValidation';
import { AuthButton } from './AuthButton';
import { AuthTextField } from './AuthTextField';

type Props = {
  visible: boolean;
  initialEmail: string;
  onClose: () => void;
};

// Identical for existing and unknown addresses, so the form can't be used to
// probe which emails have an account.
const SENT_MESSAGE = 'Falls ein Konto existiert, haben wir dir einen Link geschickt.';

export function ForgotPasswordSheet({ visible, initialEmail, onClose }: Props) {
  const { colors } = useTheme();
  const { sendPasswordReset } = useAuth();
  const cooldown = useCooldown(60);

  const [email, setEmail] = useState(initialEmail);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setEmail(initialEmail);
      setTouched(false);
      setError(null);
    }
  }, [visible, initialEmail]);

  const emailError = touched ? validateEmail(email) : null;

  const handleSend = async () => {
    setTouched(true);
    if (validateEmail(email) || loading || cooldown.active) return;
    setLoading(true);
    setError(null);
    const result = await sendPasswordReset(email);
    setLoading(false);
    // Only rate limiting is worth surfacing; anything else would leak whether
    // the account exists.
    if (result.error?.code === 'rate_limited') {
      setError(result.error.message);
      return;
    }
    setMessage(SENT_MESSAGE);
    cooldown.start();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={[styles.title, { color: colors.authTextPrimary }]}>
        Passwort vergessen?
      </Text>
      <Text style={[styles.body, { color: colors.authTextSecondary }]}>
        Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link, mit dem du ein neues
        Passwort festlegen kannst.
      </Text>

      <AuthTextField
        icon="mail"
        value={email}
        onChangeText={setEmail}
        onBlur={() => setTouched(true)}
        placeholder="E-Mail-Adresse"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={handleSend}
        error={emailError}
      />

      {message && (
        <Text style={[styles.body, styles.message, { color: colors.authTextPrimary }]}>
          {message}
        </Text>
      )}
      {error && (
        <Text style={[styles.body, styles.message, { color: colors.authError }]}>
          {error}
        </Text>
      )}

      <View style={styles.button}>
        <AuthButton
          label={cooldown.active ? `Erneut senden (${cooldown.remaining} s)` : 'Link senden'}
          onPress={handleSend}
          loading={loading}
          disabled={cooldown.active}
        />
      </View>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}>
        <Text style={[styles.cancelLabel, { color: colors.authTextPrimary }]}>Schließen</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  message: {
    marginTop: 14,
    marginBottom: 0,
  },
  button: {
    marginTop: 24,
  },
  cancel: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  cancelLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
