const CACHE_PREFIX = 'session-cache:v1';
const USER_ID_KEY = `${CACHE_PREFIX}:user-id`;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

function hasSessionStorage() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

export function getSessionUserId(): string | null {
  if (!hasSessionStorage()) return null;
  return sessionStorage.getItem(USER_ID_KEY);
}

export function setSessionUserId(userId: string) {
  if (!hasSessionStorage()) return;
  sessionStorage.setItem(USER_ID_KEY, userId);
}

export function clearSessionUserId() {
  if (!hasSessionStorage()) return;
  sessionStorage.removeItem(USER_ID_KEY);
}

function getScopedKey(key: string) {
  const userId = getSessionUserId();
  if (!userId) return null;
  return `${CACHE_PREFIX}:${userId}:${key}`;
}

export function getSessionCache<T>(key: string): T | null {
  if (!hasSessionStorage()) return null;
  const scopedKey = getScopedKey(key);
  if (!scopedKey) return null;

  const raw = sessionStorage.getItem(scopedKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed.expiresAt || Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(scopedKey);
      return null;
    }
    return parsed.value;
  } catch {
    sessionStorage.removeItem(scopedKey);
    return null;
  }
}

export function setSessionCache<T>(key: string, value: T, ttlMs: number) {
  if (!hasSessionStorage()) return;
  const scopedKey = getScopedKey(key);
  if (!scopedKey) return;

  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + ttlMs,
  };
  sessionStorage.setItem(scopedKey, JSON.stringify(entry));
}

export function invalidateSessionCache(keys: string[]) {
  if (!hasSessionStorage()) return;
  const userId = getSessionUserId();
  if (!userId) return;

  keys.forEach((key) => {
    const scopedKey = `${CACHE_PREFIX}:${userId}:${key}`;
    sessionStorage.removeItem(scopedKey);
  });
}

function readCacheEntry<T>(key: string): { value: T; isExpired: boolean } | null {
  if (!hasSessionStorage()) return null;
  const scopedKey = getScopedKey(key);
  if (!scopedKey) return null;

  const raw = sessionStorage.getItem(scopedKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed.expiresAt) {
      sessionStorage.removeItem(scopedKey);
      return null;
    }
    return { value: parsed.value, isExpired: Date.now() > parsed.expiresAt };
  } catch {
    sessionStorage.removeItem(scopedKey);
    return null;
  }
}

export async function getSessionCacheWithSWR<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const entry = readCacheEntry<T>(key);

  if (entry) {
    if (!entry.isExpired) return entry.value;

    void fetcher()
      .then((data) => setSessionCache(key, data, ttlMs))
      .catch(() => {
        // ignore background refresh errors
      });
    return entry.value;
  }

  const fresh = await fetcher();
  setSessionCache(key, fresh, ttlMs);
  return fresh;
}
