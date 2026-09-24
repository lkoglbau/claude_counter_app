import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { useAuth } from '@/store/AuthProvider';
import { useTheme } from '@/theme/useTheme';

type Params = {
  code?: string;
  sb_flow_id?: string;
  error?: string;
  error_description?: string;
};

const LINK_FAILED =
  'Der Link ist abgelaufen oder wurde in einem anderen Browser geöffnet. ' +
  'Falls du gerade deine E-Mail bestätigt hast, melde dich einfach an.';

/**
 * Landing page for Google OAuth (web) and email-confirmation links. Turns the
 * PKCE `code` into a session; the auth gate then shows the app.
 */
export default function AuthCallbackScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const { session, isRecovering, exchangeCode } = useAuth();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (params.error === 'access_denied') {
      // User backed out of the Google consent screen - not an error.
      router.replace('/login');
      return;
    }
    if (params.error || params.error_description) {
      router.replace({ pathname: '/login', params: { error: LINK_FAILED } });
      return;
    }
    if (!params.code) {
      router.replace(session ? '/' : '/login');
      return;
    }

    exchangeCode(params.code, params.sb_flow_id).then(({ error }) => {
      if (error) {
        router.replace({ pathname: '/login', params: { error: LINK_FAILED } });
      }
    });
  }, [params, session, exchangeCode, router]);

  // Navigate only once the session is in state, so the app routes are unlocked.
  useEffect(() => {
    if (session && !isRecovering) {
      router.replace('/');
    }
  }, [session, isRecovering, router]);

  return (
    <AuthScreenLayout>
      <View style={styles.center}>
        <ActivityIndicator color={colors.authTextPrimary} />
        <Text style={[styles.label, { color: colors.authTextSecondary }]}>Einen Moment …</Text>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    gap: 12,
    marginTop: 80,
  },
  label: {
    fontSize: 14,
  },
});
