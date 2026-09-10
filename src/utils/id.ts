import * as Crypto from 'expo-crypto';

/** Collision-resistant id for a new counter. */
export function createId(): string {
  return Crypto.randomUUID();
}
