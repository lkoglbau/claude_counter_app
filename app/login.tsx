import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthModeToggle, type AuthMode } from '@/components/auth/AuthModeToggle';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { ForgotPasswordSheet } from '@/components/auth/ForgotPasswordSheet';
import { GoogleLogo } from '@/components/auth/GoogleLogo';
import { SocialButton } from '@/components/auth/SocialButton';
import { useAuth } from '@/store/AuthProvider';
import { useTheme } from '@/theme/useTheme';
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
  type MappedAuthError,
} from '@/utils/authValidation';
import { showError } from '@/utils/confirm';

const HEADINGS: Record<AuthMode, string> = {
  login: 'Melde dich an und zähl die Tage seit dem Aufhören',
  register: 'Hör auf, zähl die Tage. Ein Ausrutscher startet neu.',
};

type Field = 'name' | 'email' | 'password' | 'confirm';

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ error?: string }>();
  const auth = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(auth.rememberMe);

  // Field errors appear only after a blur or a submit attempt, not while typing.
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(params.error ?? null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [forgotVisible, setForgotVisible] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  // The stored choice loads asynchronously on native.
  useEffect(() => setRemember(auth.rememberMe), [auth.rememberMe]);

  const isRegister = mode === 'register';

  const errors: Record<Field, string | null> = {
    name: isRegister ? validateName(name) : null,
    email: validateEmail(email),
    password: validatePassword(password),
    confirm: isRegister ? validatePasswordMatch(password, confirm) : null,
  };
  const visibleError = (field: Field) => (submitted || touched[field] ? errors[field] : null);
  const markTouched = (field: Field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const resetFeedback = () => {
    setFormError(null);
    setUnconfirmed(false);
    setInfo(null);
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setTouched({});
    setSubmitted(false);
    resetFeedback();
  };

  const handleAuthError = (error: MappedAuthError, title: string) => {
    if (error.code === 'unknown') {
      showError(title, error.message);
      return;
    }
    setFormError(error.message);
    setUnconfirmed(error.code === 'email_not_confirmed');
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    resetFeedback();
    if (Object.values(errors).some(Boolean) || loading) return;

    setLoading(true);
    if (isRegister) {
      const result = await auth.signUp(name, email, password, remember);
      setLoading(false);
      if (result.error) {
        handleAuthError(result.error, 'Registrierung fehlgeschlagen');
      } else if (result.needsConfirmation) {
        router.push({ pathname: '/verify-email', params: { email: email.trim().toLowerCase() } });
      }
      // Otherwise a session exists and the auth gate takes over.
      return;
    }

    const result = await auth.signIn(email, password, remember);
    setLoading(false);
    if (result.error) handleAuthError(result.error, 'Anmeldung fehlgeschlagen');
  };

  const handleGoogle = async () => {
    resetFeedback();
    setGoogleLoading(true);
    const result = await auth.signInWithGoogle(remember);
    setGoogleLoading(false);
    if (result.error) handleAuthError(result.error, 'Google-Anmeldung fehlgeschlagen');
  };

  const handleResend = async () => {
    const result = await auth.resendConfirmation(email);
    if (result.error) {
      handleAuthError(result.error, 'Senden fehlgeschlagen');
      return;
    }
    setUnconfirmed(false);
    setFormError(null);
    setInfo('Wir haben dir einen neuen Bestätigungslink geschickt.');
  };

  const footer = (
    <Text style={[styles.footerText, { color: colors.authTextSecondary }]}>
      {isRegister ? 'Schon ein Konto? ' : 'Noch kein Konto? '}
      <Text
        accessibilityRole="link"
        onPress={() => switchMode(isRegister ? 'login' : 'register')}
        style={[styles.footerLink, { color: colors.authTextPrimary }]}
      >
        {isRegister ? 'Anmelden' : 'Konto erstellen'}
      </Text>
    </Text>
  );

  return (
    <AuthScreenLayout footer={footer}>
      <Animated.Text
        key={`heading-${mode}`}
        entering={FadeIn.duration(200)}
        accessibilityRole="header"
        style={[styles.heading, { color: colors.authTextPrimary }]}
      >
        {HEADINGS[mode]}
      </Animated.Text>

      <AuthModeToggle mode={mode} onChange={switchMode} />

      <Animated.View key={`fields-${mode}`} entering={FadeIn.duration(200)} style={styles.fields}>
        {isRegister && (
          <AuthTextField
            icon="user"
            value={name}
            onChangeText={setName}
            onBlur={markTouched('name')}
            placeholder="Name"
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => emailRef.current?.focus()}
            error={visibleError('name')}
          />
        )}
        <AuthTextField
          ref={emailRef}
          icon="mail"
          value={email}
          onChangeText={setEmail}
          onBlur={markTouched('email')}
          placeholder="E-Mail-Adresse"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={visibleError('email')}
        />
        <AuthTextField
          ref={passwordRef}
          icon="lock"
          password
          value={password}
          onChangeText={setPassword}
          onBlur={markTouched('password')}
          placeholder="Passwort"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete={isRegister ? 'new-password' : 'password'}
          textContentType={isRegister ? 'newPassword' : 'password'}
          returnKeyType={isRegister ? 'next' : 'go'}
          submitBehavior={isRegister ? 'submit' : 'blurAndSubmit'}
          onSubmitEditing={isRegister ? () => confirmRef.current?.focus() : handleSubmit}
          error={visibleError('password')}
        />
        {isRegister && (
          <AuthTextField
            ref={confirmRef}
            icon="lock"
            password
            value={confirm}
            onChangeText={setConfirm}
            onBlur={markTouched('confirm')}
            placeholder="Passwort bestätigen"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
            error={visibleError('confirm')}
          />
        )}
      </Animated.View>

      <View style={styles.rememberRow}>
        <AuthCheckbox label="Angemeldet bleiben" checked={remember} onChange={setRemember} />
        {!isRegister && (
          <Pressable accessibilityRole="button" onPress={() => setForgotVisible(true)} hitSlop={8}>
            <Text style={[styles.forgot, { color: colors.authTextPrimary }]}>
              Passwort vergessen?
            </Text>
          </Pressable>
        )}
      </View>

      {(formError || info) && (
        <View style={styles.feedback}>
          {formError && (
            <Text style={[styles.feedbackText, { color: colors.authError }]}>{formError}</Text>
          )}
          {unconfirmed && (
            <Text
              accessibilityRole="button"
              onPress={handleResend}
              style={[styles.feedbackAction, { color: colors.authTextPrimary }]}
            >
              Link erneut senden
            </Text>
          )}
          {info && (
            <Text style={[styles.feedbackText, { color: colors.authTextSecondary }]}>{info}</Text>
          )}
        </View>
      )}

      <View style={styles.submit}>
        <AuthButton
          label={isRegister ? 'Registrieren' : 'Anmelden'}
          onPress={handleSubmit}
          loading={loading}
          disabled={googleLoading}
        />
      </View>

      <AuthDivider label={isRegister ? 'Oder registrieren mit' : 'Oder anmelden mit'} />

      {/* Row so an Apple button can be added as a second column later. */}
      <View style={styles.socialRow}>
        <SocialButton
          label="Google"
          icon={<GoogleLogo size={18} />}
          onPress={handleGoogle}
          loading={googleLoading}
          disabled={loading}
        />
      </View>

      <ForgotPasswordSheet
        visible={forgotVisible}
        initialEmail={email.trim()}
        onClose={() => setForgotVisible(false)}
      />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 32,
  },
  fields: {
    marginTop: 24,
    gap: 14,
  },
  rememberRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgot: {
    fontSize: 14,
    fontWeight: '500',
  },
  feedback: {
    marginTop: 16,
    gap: 6,
  },
  feedbackText: {
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackAction: {
    fontSize: 13,
    fontWeight: '600',
  },
  submit: {
    marginTop: 24,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
  footerLink: {
    fontWeight: '600',
  },
});
