import { AuthError } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '@/services/supabaseClient';

// Closes the auth popup/tab on web when it lands back on the app; no-op on native.
WebBrowser.maybeCompleteAuthSession();

const APP_SCHEME = 'dayssince';

/**
 * Where Supabase should send the user back to. Web uses the current origin so
 * production, Vercel previews and localhost all work without config changes.
 */
export function getRedirectUrl(path: 'auth/callback' | 'reset-password'): string {
  if (Platform.OS === 'web') {
    return `${window.location.origin}/${path}`;
  }
  return makeRedirectUri({ scheme: APP_SCHEME, path });
}

export async function signInWithPassword(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name.trim() },
      emailRedirectTo: getRedirectUrl('auth/callback'),
    },
  });
  if (error) return { error, needsConfirmation: false };

  // With "Confirm email" on, Supabase answers a signup for an existing address
  // with a fake user without identities instead of an error.
  if (data.user && data.user.identities?.length === 0) {
    return {
      error: new AuthError('User already registered', 422, 'user_already_exists'),
      needsConfirmation: false,
    };
  }
  return { error: null, needsConfirmation: !data.session };
}

export async function resendSignupConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: getRedirectUrl('auth/callback') },
  });
  return { error };
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getRedirectUrl('reset-password'),
  });
  return { error };
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  return { error };
}

/** `flowId` is the `sb_flow_id` query param; web reads it from the URL itself. */
export async function exchangeCode(code: string, flowId?: string) {
  const { error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );
  return { error };
}

export async function hasSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}

/**
 * Google via Supabase OAuth (PKCE). Web does a full-page redirect to
 * /auth/callback. Native opens an auth session and exchanges the returned
 * code here. `cancelled` = user closed the browser, which isn't an error.
 */
export async function signInWithGoogle(): Promise<{ error: AuthError | null; cancelled: boolean }> {
  const redirectTo = getRedirectUrl('auth/callback');

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    return { error, cancelled: false };
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) return { error, cancelled: false };

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return { error: null, cancelled: true };

  const params = Linking.parse(result.url).queryParams ?? {};
  const code = typeof params.code === 'string' ? params.code : null;
  if (!code) {
    const description =
      typeof params.error_description === 'string' ? params.error_description : 'Missing code';
    return { error: new AuthError(description), cancelled: false };
  }
  const flowId = typeof params.sb_flow_id === 'string' ? params.sb_flow_id : undefined;
  const exchanged = await exchangeCode(code, flowId);
  return { error: exchanged.error, cancelled: false };
}
