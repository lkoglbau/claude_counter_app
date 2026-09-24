import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. Check your .env file.',
  );
}

const isWeb = Platform.OS === 'web';
const hasWindow = typeof window !== 'undefined';

const REMEMBER_ME_KEY = '@days-since/remember-me';

// Same key supabase-js derives by default, spelled out so we can clear the
// session from the storage that is *not* in use when "remember me" flips -
// and so existing sessions keep working after this adapter was introduced.
// (String parsing instead of `new URL().hostname`, which React Native's URL
// polyfill doesn't implement on every version.)
const projectRef = supabaseUrl.replace(/^https?:\/\//, '').split(/[.:/]/)[0];
const SESSION_STORAGE_KEY = `sb-${projectRef}-auth-token`;

type KeyValueStore = {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => void | Promise<void>;
  removeItem: (key: string) => void | Promise<void>;
};

const memory = new Map<string, string>();
const memoryStore: KeyValueStore = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => void memory.set(key, value),
  removeItem: (key) => void memory.delete(key),
};

// Survives app restarts / closed tabs.
const persistentStore: KeyValueStore = isWeb
  ? hasWindow
    ? window.localStorage
    : memoryStore
  : AsyncStorage;

// Lives only as long as the tab (web) or the JS runtime (native cold start).
const ephemeralStore: KeyValueStore = isWeb && hasWindow ? window.sessionStorage : memoryStore;

let rememberMe = true;
const rememberMeReady: Promise<void> = Promise.resolve(persistentStore.getItem(REMEMBER_ME_KEY))
  .then((value) => {
    rememberMe = value !== 'false';
  })
  .catch((error) => console.error('Failed to read remember-me flag', error));

// PKCE verifiers must outlive an OAuth redirect or an email link opened in a
// new tab, so they always go to persistent storage regardless of the flag.
function storeFor(key: string): KeyValueStore {
  if (key.endsWith('code-verifier')) return persistentStore;
  return rememberMe ? persistentStore : ephemeralStore;
}

const authStorage: SupportedStorage = {
  getItem: async (key) => {
    await rememberMeReady;
    return storeFor(key).getItem(key);
  },
  setItem: async (key, value) => {
    await rememberMeReady;
    await storeFor(key).setItem(key, value);
  },
  removeItem: async (key) => {
    await rememberMeReady;
    await storeFor(key).removeItem(key);
  },
};

export async function getRememberMe(): Promise<boolean> {
  await rememberMeReady;
  return rememberMe;
}

/**
 * Must be called *before* signIn/signUp/OAuth so the resulting session lands
 * in the right storage. Also drops any session left in the other storage.
 */
export async function setRememberMe(value: boolean): Promise<void> {
  await rememberMeReady;
  rememberMe = value;
  const unused = value ? ephemeralStore : persistentStore;
  try {
    await persistentStore.setItem(REMEMBER_ME_KEY, String(value));
    await unused.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to persist remember-me flag', error);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    storageKey: SESSION_STORAGE_KEY,
    autoRefreshToken: true,
    persistSession: true,
    flowType: 'pkce',
    // Codes are exchanged explicitly by app/auth/callback and
    // app/reset-password; letting the client also do it on init would burn
    // the single-use code before those routes get to it.
    detectSessionInUrl: false,
  },
});
