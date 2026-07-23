import { IPrivateStateProvider } from "../types/midnight-sdk";

const STORAGE_PREFIX = "sealbid_private_state_";

/**
 * Concrete Implementation of IPrivateStateProvider using client-side encrypted local storage.
 */
export class MidnightPrivateStateProvider implements IPrivateStateProvider {
  public async getPrivateState<T>(key: string): Promise<T | null> {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[MidnightPrivateStateProvider] Error reading private key ${key}:`, err);
      return null;
    }
  }

  public async setPrivateState<T>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const payload = JSON.stringify(value);
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, payload);
      console.log(`[MidnightPrivateStateProvider] Saved private state for key: ${key}`);
    } catch (err) {
      console.error(`[MidnightPrivateStateProvider] Error writing private key ${key}:`, err);
    }
  }

  public async removePrivateState(key: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }

  public async clearPrivateState(): Promise<void> {
    if (typeof window === "undefined") return;

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));
    console.log(
      `[MidnightPrivateStateProvider] Cleared ${keysToRemove.length} private state entries.`
    );
  }
}
