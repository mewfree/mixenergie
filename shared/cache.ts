export const SNAPSHOT_FRESH_MS = 15 * 60 * 1000;
export const SNAPSHOT_MAX_MS = 6 * 60 * 60 * 1000;
export const YEAR_FRESH_MS = 24 * 60 * 60 * 1000;
export const SNAPSHOT_TTL_SECONDS = 6 * 60 * 60;
export const YEAR_TTL_SECONDS = 7 * 24 * 60 * 60;
export const KV_READ_CACHE_TTL = 300;
export const LOCK_TTL_SECONDS = 45;

export const KV_SNAPSHOT = "mix:snapshot";
export const KV_YEAR = "mix:year";
export const KV_LOCK = "mix:lock";

export type CacheState = "fresh" | "stale" | "expired";

export function cacheAge(storedAt: number, now = Date.now()): number {
  return Math.max(0, now - storedAt);
}

export function cacheState(
  storedAt: number,
  freshMs: number,
  maxMs: number,
  now = Date.now(),
): CacheState {
  const age = cacheAge(storedAt, now);
  if (age < freshMs) return "fresh";
  if (age < maxMs) return "stale";
  return "expired";
}
