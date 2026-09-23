import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/services/supabaseClient';
import { claimOrphanCounters } from './countersRepo';

// Marks a freshly-registered user id as "hasn't seen the onboarding info yet".
// Persisted (not just in-memory) because SIGNED_IN for a signup can happen
// later, in a different app session, if Supabase ever requires email
// confirmation. Keyed by user id so it can never leak onboarding to a
// different, already-existing user who signs in on the same device.
const PENDING_ONBOARDING_KEY = '@days-since/pending-onboarding-user-id';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  showOnboarding: boolean;
  dismissOnboarding: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (event === 'SIGNED_IN' && newSession?.user) {
        claimOrphanCounters().catch((error) =>
          console.error('Failed to claim orphaned counters', error),
        );

        const userId = newSession.user.id;
        AsyncStorage.getItem(PENDING_ONBOARDING_KEY)
          .then((pendingUserId) => {
            if (pendingUserId === userId) {
              setShowOnboarding(true);
            }
          })
          .catch((error) => console.error('Failed to read onboarding flag', error));
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (!error && data.user) {
      // Consumed on the next SIGNED_IN event for this user id.
      AsyncStorage.setItem(PENDING_ONBOARDING_KEY, data.user.id).catch((e) =>
        console.error('Failed to persist onboarding flag', e),
      );
    }

    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    AsyncStorage.removeItem(PENDING_ONBOARDING_KEY).catch((e) =>
      console.error('Failed to clear onboarding flag', e),
    );
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signUp,
    signOut,
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
