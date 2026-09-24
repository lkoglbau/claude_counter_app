import type { AuthError, Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getRememberMe, setRememberMe, supabase } from '@/services/supabaseClient';
import { mapAuthError, type MappedAuthError } from '@/utils/authValidation';
import * as authService from './authService';
import { claimOrphanCounters } from './countersRepo';

// Marks a freshly-registered email as "hasn't seen the onboarding info yet".
// Persisted (not just in-memory) because SIGNED_IN for a signup happens
// later, possibly in a different app session, when Supabase requires email
// confirmation. Keyed by email (not user id) because that's the only
// identifier known *before* calling signUp() - and it must be written
// before that call: supabase-js emits SIGNED_IN from inside signUp()
// itself (awaited before signUp()'s promise resolves) when email
// confirmation is off, i.e. before any code after `await signUp(...)` in
// this file gets to run. Writing the marker only after that await would
// always lose the race against the SIGNED_IN handler's read below.
const PENDING_ONBOARDING_EMAIL_KEY = '@days-since/pending-onboarding-email';

// OAuth accounts are created on first sign-in, so there's no signUp() call to
// hang the marker on. A user whose first and latest sign-in are this close
// together has just been created.
const NEW_OAUTH_USER_WINDOW_MS = 60_000;

function isFreshOAuthUser(user: User): boolean {
  if (user.app_metadata.provider === 'email' || !user.last_sign_in_at) return false;
  const created = Date.parse(user.created_at);
  const lastSignIn = Date.parse(user.last_sign_in_at);
  return Math.abs(lastSignIn - created) < NEW_OAUTH_USER_WINDOW_MS;
}

type AuthResult = { error: MappedAuthError | null };

function toResult(error: AuthError | null): AuthResult {
  return { error: error ? mapAuthError(error) : null };
}

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Last "Angemeldet bleiben" choice, used as the checkbox's initial value. */
  rememberMe: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<AuthResult>;
  signUp: (
    name: string,
    email: string,
    password: string,
    remember: boolean,
  ) => Promise<AuthResult & { needsConfirmation: boolean }>;
  signInWithGoogle: (remember: boolean) => Promise<AuthResult>;
  resendConfirmation: (email: string) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  /** Exchanges a PKCE `code` from an email link or OAuth redirect. */
  exchangeCode: (code: string, flowId?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /**
   * True between opening a password-reset link and saving the new password.
   * The link yields a real session, so without this the auth gate would let
   * the user straight into the app.
   */
  isRecovering: boolean;
  finishRecovery: () => void;
  showOnboarding: boolean;
  dismissOnboarding: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rememberMe, setRememberMeState] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  // SIGNED_IN also fires on e.g. tab refocus; don't re-open onboarding for
  // a fresh OAuth user that already dismissed it.
  const oauthOnboardingShownFor = useRef<string | null>(null);

  useEffect(() => {
    getRememberMe().then(setRememberMeState);

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
        return;
      }
      if (event === 'SIGNED_OUT') {
        setIsRecovering(false);
        return;
      }
      if (event !== 'SIGNED_IN' || !newSession?.user) return;

      const user = newSession.user;
      claimOrphanCounters().catch((error) =>
        console.error('Failed to claim orphaned counters', error),
      );

      if (isFreshOAuthUser(user) && oauthOnboardingShownFor.current !== user.id) {
        oauthOnboardingShownFor.current = user.id;
        setShowOnboarding(true);
        return;
      }

      const userEmail = user.email?.toLowerCase();
      if (userEmail) {
        AsyncStorage.getItem(PENDING_ONBOARDING_EMAIL_KEY)
          .then((pendingEmail) => {
            if (pendingEmail && pendingEmail === userEmail) {
              setShowOnboarding(true);
            }
          })
          .catch((error) => console.error('Failed to read onboarding flag', error));
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Must run before any call that creates a session - see setRememberMe().
  const applyRememberMe = async (remember: boolean) => {
    setRememberMeState(remember);
    await setRememberMe(remember);
  };

  const signIn = async (email: string, password: string, remember: boolean) => {
    await applyRememberMe(remember);
    const { error } = await authService.signInWithPassword(email.trim(), password);
    return toResult(error);
  };

  const signUp = async (name: string, email: string, password: string, remember: boolean) => {
    const normalizedEmail = email.trim().toLowerCase();
    await applyRememberMe(remember);

    // Must be written *before* calling signUp() - see the comment on
    // PENDING_ONBOARDING_EMAIL_KEY above for why.
    try {
      await AsyncStorage.setItem(PENDING_ONBOARDING_EMAIL_KEY, normalizedEmail);
    } catch (e) {
      console.error('Failed to persist onboarding flag', e);
    }

    const { error, needsConfirmation } = await authService.signUp(name, normalizedEmail, password);

    if (error) {
      // Registration failed - clear the marker so it can't wrongly show
      // onboarding to a later, unrelated successful sign-in with this email.
      AsyncStorage.removeItem(PENDING_ONBOARDING_EMAIL_KEY).catch((e) =>
        console.error('Failed to clear onboarding flag', e),
      );
    }

    return { ...toResult(error), needsConfirmation };
  };

  const signInWithGoogle = async (remember: boolean) => {
    await applyRememberMe(remember);
    const { error } = await authService.signInWithGoogle();
    return toResult(error);
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await authService.resendSignupConfirmation(email.trim().toLowerCase());
    return toResult(error);
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await authService.sendPasswordReset(email.trim().toLowerCase());
    return toResult(error);
  };

  const updatePassword = async (password: string) => {
    const { error } = await authService.updatePassword(password);
    return toResult(error);
  };

  const exchangeCode = async (code: string, flowId?: string) => {
    const { error } = await authService.exchangeCode(code, flowId);
    if (error && (await authService.hasSession())) {
      // Already signed in, e.g. the native OAuth flow exchanged this code
      // first and Android also delivered the redirect as a deep link.
      return { error: null };
    }
    return toResult(error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const finishRecovery = () => setIsRecovering(false);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    AsyncStorage.removeItem(PENDING_ONBOARDING_EMAIL_KEY).catch((e) =>
      console.error('Failed to clear onboarding flag', e),
    );
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    rememberMe,
    signIn,
    signUp,
    signInWithGoogle,
    resendConfirmation,
    sendPasswordReset,
    updatePassword,
    exchangeCode,
    signOut,
    isRecovering,
    finishRecovery,
    showOnboarding,
    dismissOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
