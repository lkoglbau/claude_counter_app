import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { useCooldown } from '@/hooks/useCooldown';
import { useAuth } from '@/store/AuthProvider';
import { useTheme } from '@/theme/useTheme';
import { showError } from '@/utils/confirm';

/** Shown after signUp while the account still waits for email confirmation. */
export default function VerifyEmailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const { resendConfirmation } = useAuth();
  const cooldown = useCooldown(60);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  // signUp() just sent the first mail.
  const { start } = cooldown;
  useEffect(start, [start]);

  const handleResend = async () => {
    if (!email || cooldown.active) return;
    setLoading(true);
    const result = await resendConfirmation(email);
    setLoading(false);
    if (result.error) {
      if (result.error.code === 'unknown') showError('Senden fehlgeschlagen', result.error.message);
      else setInfo(result.error.message);
      return;
    }
    setInfo('Wir haben dir einen neuen Link geschickt.');
    cooldown.start();
  };

  const backToLogin = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  };

  const footer = (
    <Text
      accessibilityRole="link"
      onPress={backToLogin}
      style={[styles.link, { color: colors.authTextPrimary }]}
    >
      Zurück zum Login
    </Text>
  );

  return (
    <AuthScreenLayout footer={footer}>
      <View style={[styles.iconCircle, { backgroundColor: colors.authSurface, borderColor: colors.authBorder }]}>
        <Feather name="mail" size={30} color={colors.authTextPrimary} />
      </View>
      <Text accessibilityRole="header" style={[styles.heading, { color: colors.authTextPrimary }]}>
        Bestätige deine E-Mail
      </Text>
      <Text style={[styles.body, { color: colors.authTextSecondary }]}>
        Wir haben einen Link an{' '}
        <Text style={[styles.email, { color: colors.authTextPrimary }]}>{email}</Text> geschickt.
        Tippe darauf, um dein Konto zu aktivieren.
      </Text>

      <AuthButton
        label={cooldown.active ? `E-Mail erneut senden (${cooldown.remaining} s)` : 'E-Mail erneut senden'}
        onPress={handleResend}
        loading={loading}
        disabled={cooldown.active || !email}
      />
      {info && <Text style={[styles.info, { color: colors.authTextSecondary }]}>{info}</Text>}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  email: {
    fontWeight: '600',
  },
  info: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
});
