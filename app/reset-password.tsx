import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { useAuth } from '@/store/AuthProvider';
import { useTheme } from '@/theme/useTheme';
import { validatePassword, validatePasswordMatch } from '@/utils/authValidation';
import { showError } from '@/utils/confirm';

type Phase = 'verifying' | 'form' | 'invalid' | 'done';

type Params = { code?: string; sb_flow_id?: string };

export default function ResetPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const { session, isRecovering, exchangeCode, updatePassword, finishRecovery } = useAuth();

  const [phase, setPhase] = useState<Phase>(params.code ? 'verifying' : 'form');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const confirmRef = useRef<TextInput>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !params.code) return;
    started.current = true;
    // Emits PASSWORD_RECOVERY, which flips `isRecovering` and keeps the gate shut.
    exchangeCode(params.code, params.sb_flow_id).then(({ error }) => {
      setPhase(error ? 'invalid' : 'form');
    });
  }, [params.code, params.sb_flow_id, exchangeCode]);

  // Opened without a (valid) link, e.g. by typing the URL.
  const effectivePhase: Phase =
    phase === 'form' && !(session && isRecovering) ? 'invalid' : phase;

  useEffect(() => {
    if (leaving && session && !isRecovering) router.replace('/');
  }, [leaving, session, isRecovering, router]);

  const errors = {
    password: validatePassword(password),
    confirm: validatePasswordMatch(password, confirm),
  };

  const handleSave = async () => {
    setSubmitted(true);
    setFormError(null);
    if (errors.password || errors.confirm || loading) return;
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (!result.error) {
      setPhase('done');
    } else if (result.error.code === 'unknown') {
      showError('Passwort ändern fehlgeschlagen', result.error.message);
    } else {
      setFormError(result.error.message);
    }
  };

  const continueToApp = () => {
    finishRecovery();
    setLeaving(true);
  };

  const leaveInvalid = () => {
    if (session && !isRecovering) router.replace('/');
    else router.replace('/login');
  };

  const heading = (text: string) => (
    <Text accessibilityRole="header" style={[styles.heading, { color: colors.authTextPrimary }]}>
      {text}
    </Text>
  );

  return (
    <AuthScreenLayout>
      {effectivePhase === 'verifying' && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.authTextPrimary} />
        </View>
      )}

      {effectivePhase === 'invalid' && (
        <>
          {heading('Link ungültig')}
          <Text style={[styles.body, { color: colors.authTextSecondary }]}>
            Der Link ist abgelaufen oder wurde schon benutzt. Fordere über „Passwort vergessen?“
            einen neuen an.
          </Text>
          <AuthButton label="Zurück zum Login" onPress={leaveInvalid} />
        </>
      )}

      {effectivePhase === 'form' && (
        <>
          {heading('Neues Passwort festlegen')}
          <View style={styles.fields}>
            <AuthTextField
              icon="lock"
              password
              value={password}
              onChangeText={setPassword}
              placeholder="Neues Passwort"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => confirmRef.current?.focus()}
              error={submitted ? errors.password : null}
            />
            <AuthTextField
              ref={confirmRef}
              icon="lock"
              password
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Passwort bestätigen"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleSave}
              error={submitted ? errors.confirm : null}
            />
          </View>
          {formError && (
            <Text style={[styles.error, { color: colors.authError }]}>{formError}</Text>
          )}
          <View style={styles.submit}>
            <AuthButton label="Passwort speichern" onPress={handleSave} loading={loading} />
          </View>
        </>
      )}

      {effectivePhase === 'done' && (
        <>
          {heading('Passwort geändert.')}
          <Text style={[styles.body, { color: colors.authTextSecondary }]}>
            Du bist jetzt mit deinem neuen Passwort angemeldet.
          </Text>
          <AuthButton label="Weiter zur App" onPress={continueToApp} />
        </>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    marginTop: 80,
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  fields: {
    marginTop: 16,
    gap: 14,
  },
  error: {
    fontSize: 13,
    marginTop: 16,
  },
  submit: {
    marginTop: 24,
  },
});
