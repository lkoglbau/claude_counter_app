import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useAuth } from '@/store/AuthProvider';
import { RADIUS, SPACING, TYPOGRAPHY } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Mode = 'signIn' | 'signUp';

export default function LoginScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const canSubmit = email.trim().length > 3 && password.length >= 6;

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    const action = mode === 'signIn' ? signIn : signUp;
    const { error: authError } = await action(email.trim(), password);

    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    if (mode === 'signUp') {
      setInfo('Konto angelegt. Falls Bestätigung nötig ist, prüf dein E-Mail-Postfach.');
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
    setError(null);
    setInfo(null);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + SPACING.xxxl, paddingBottom: insets.bottom + SPACING.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Days Since</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Zähle die Tage seit dem Aufhören – ein Ausrutscher startet den Zähler neu.
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {mode === 'signIn'
              ? 'Melde dich an, um deine Counter zu sehen.'
              : 'Leg ein Konto an und starte deinen ersten Counter.'}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>E-Mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="du@beispiel.de"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            style={[styles.input, { backgroundColor: colors.fieldBackground, color: colors.text }]}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Passwort</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="mind. 6 Zeichen"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            style={[styles.input, { backgroundColor: colors.fieldBackground, color: colors.text }]}
          />
        </View>

        {error && (
          <Text style={[styles.message, { color: colors.destructive }]}>{error}</Text>
        )}
        {info && (
          <Text style={[styles.message, { color: colors.textSecondary }]}>{info}</Text>
        )}

        <View style={styles.actions}>
          <PrimaryButton
            label={mode === 'signIn' ? 'Anmelden' : 'Konto erstellen'}
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={loading}
          />
          <PrimaryButton
            label={mode === 'signIn' ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
            variant="ghost"
            onPress={toggleMode}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: SPACING.xl,
    gap: SPACING.xxl,
  },
  header: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.largeTitle,
  },
  tagline: {
    ...TYPOGRAPHY.subhead,
  },
  subtitle: {
    ...TYPOGRAPHY.subhead,
  },
  field: {
    gap: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.body,
  },
  input: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    ...TYPOGRAPHY.body,
  },
  message: {
    ...TYPOGRAPHY.subhead,
  },
  actions: {
    gap: SPACING.md,
  },
});
