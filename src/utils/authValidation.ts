import type { AuthError } from '@supabase/supabase-js';

/** Supabase's default minimum; keep in sync with Auth → Providers → Email. */
export const MIN_PASSWORD_LENGTH = 6;

// Deliberately loose: the server is the real authority, this only catches typos.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  return EMAIL_PATTERN.test(email.trim()) ? null : 'Bitte gib eine gültige E-Mail-Adresse ein.';
}

export function validatePassword(password: string): string | null {
  return password.length >= MIN_PASSWORD_LENGTH ? null : `Mind. ${MIN_PASSWORD_LENGTH} Zeichen.`;
}

export function validateName(name: string): string | null {
  return name.trim().length > 0 ? null : 'Bitte gib deinen Namen ein.';
}

export function validatePasswordMatch(password: string, confirm: string): string | null {
  return password === confirm ? null : 'Die Passwörter stimmen nicht überein.';
}

/** Stable codes the UI branches on (e.g. offering "resend confirmation"). */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'user_already_exists'
  | 'email_not_confirmed'
  | 'rate_limited'
  | 'weak_password'
  | 'same_password'
  | 'unknown';

export type MappedAuthError = { code: AuthErrorCode; message: string };

const MESSAGES: Record<AuthErrorCode, string> = {
  invalid_credentials: 'E-Mail oder Passwort ist falsch.',
  user_already_exists: 'Für diese E-Mail gibt es bereits ein Konto.',
  email_not_confirmed: 'Bitte bestätige zuerst deine E-Mail.',
  rate_limited: 'Zu viele Versuche. Bitte warte kurz.',
  weak_password: 'Das Passwort ist zu schwach. Wähle ein längeres.',
  same_password: 'Das neue Passwort muss sich vom alten unterscheiden.',
  unknown: 'Etwas ist schiefgelaufen. Bitte versuch es erneut.',
};

export function authErrorMessage(code: AuthErrorCode): string {
  return MESSAGES[code];
}

/**
 * Maps a Supabase auth error to German copy. Prefers the machine-readable
 * `code` and falls back to message matching for older/edge responses.
 */
export function mapAuthError(error: AuthError): MappedAuthError {
  const code = error.code ?? '';
  const message = error.message.toLowerCase();

  let mapped: AuthErrorCode = 'unknown';
  if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
    mapped = 'invalid_credentials';
  } else if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    message.includes('already registered')
  ) {
    mapped = 'user_already_exists';
  } else if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    mapped = 'email_not_confirmed';
  } else if (
    code.startsWith('over_') ||
    error.status === 429 ||
    message.includes('rate limit')
  ) {
    mapped = 'rate_limited';
  } else if (code === 'weak_password') {
    mapped = 'weak_password';
  } else if (code === 'same_password') {
    mapped = 'same_password';
  }

  if (mapped === 'unknown') {
    console.error('Unmapped auth error', error);
  }
  return { code: mapped, message: MESSAGES[mapped] };
}
