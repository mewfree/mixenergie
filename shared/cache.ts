export const SNAPSHOT_FRESH_MS = 15 * 60 * 1000;
export const SNAPSHOT_MAX_MS = 6 * 60 * 60 * 1000;
export const YEAR_FRESH_MS = 24 * 60 * 60 * 1000;
export const SNAPSHOT_TTL_SECONDS = 6 * 60 * 60;
export const YEAR_TTL_SECONDS = 7 * 24 * 60 * 60;
export const KV_READ_CACHE_TTL = 60;
export const LOCK_TTL_SECONDS = 60;
export const DEMAND_INTERVAL_MS = 15 * 60 * 1000;
export const DEMAND_PUBLISH_SLACK_MS = 90 * 1000;

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

function wallClockIso(now: number, timeZone: string): string | null {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(now));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");
  if (!year || !month || !day || !hour || !minute || !second) return null;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

/** Age of an HQ Eastern wall-clock stamp versus now in that zone. */
export function hqDataAgeMs(
  stamp: string,
  now = Date.now(),
  timeZone = "America/Toronto",
): number {
  const wall = wallClockIso(now, timeZone);
  if (!wall) return 0;
  const stampMs = Date.parse(stamp.endsWith("Z") ? stamp : `${stamp}Z`);
  const nowMs = Date.parse(`${wall}Z`);
  if (!Number.isFinite(stampMs) || !Number.isFinite(nowMs)) return 0;
  return Math.max(0, nowMs - stampMs);
}

/**
 * A rewrite of the same 15-minute demand interval must not look fresh
 * past the next interval. HQ timestamps are Eastern wall clocks, so age
 * is compared in America/Toronto, not against KV storedAt.
 */
export function snapshotCacheState(
  storedAt: number,
  demandAt: string | undefined,
  now = Date.now(),
): CacheState {
  const write = cacheState(storedAt, SNAPSHOT_FRESH_MS, SNAPSHOT_MAX_MS, now);
  if (write === "expired") return "expired";
  if (
    demandAt &&
    hqDataAgeMs(demandAt, now) >= DEMAND_INTERVAL_MS + DEMAND_PUBLISH_SLACK_MS
  ) {
    return "stale";
  }
  return write;
}

export function mixCacheControl(state: CacheState | "miss"): string {
  if (state === "fresh" || state === "miss") {
    return "public, max-age=60, stale-while-revalidate=60";
  }
  return "public, max-age=0, stale-while-revalidate=30";
}
