import { describe, expect, it } from "vitest";
import {
  cacheAge,
  cacheState,
  hqDataAgeMs,
  mixCacheControl,
  snapshotCacheState,
} from "./cache.ts";

describe("cache freshness", () => {
  const now = 1_000_000;

  it("treats a recent write as fresh", () => {
    expect(cacheState(now - 60_000, 15 * 60_000, 6 * 3600_000, now)).toBe("fresh");
  });

  it("serves stale before the hard expiry", () => {
    expect(cacheState(now - 30 * 60_000, 15 * 60_000, 6 * 3600_000, now)).toBe(
      "stale",
    );
  });

  it("expires after the max age", () => {
    expect(cacheState(now - 7 * 3600_000, 15 * 60_000, 6 * 3600_000, now)).toBe(
      "expired",
    );
  });

  it("never returns a negative age", () => {
    expect(cacheAge(now + 1000, now)).toBe(0);
  });
});

describe("HQ demand age", () => {
  // 10:48 America/Toronto on 15 Aug 2026 is EDT (UTC−4) → 14:48Z
  const tenFortyEight = Date.parse("2026-08-15T14:48:00Z");

  it("compares HQ wall clocks against Eastern now", () => {
    expect(hqDataAgeMs("2026-08-15T10:15:00", tenFortyEight)).toBe(33 * 60_000);
    expect(hqDataAgeMs("2026-08-15T10:45:00", tenFortyEight)).toBe(3 * 60_000);
  });

  it("treats a just-rewritten old interval as stale", () => {
    const storedAt = Date.parse("2026-08-15T14:40:00Z");
    expect(snapshotCacheState(storedAt, "2026-08-15T10:15:00", tenFortyEight)).toBe(
      "stale",
    );
  });

  it("keeps the current demand interval fresh", () => {
    const storedAt = Date.parse("2026-08-15T14:46:00Z");
    expect(snapshotCacheState(storedAt, "2026-08-15T10:45:00", tenFortyEight)).toBe(
      "fresh",
    );
  });

  it("still expires a very old write", () => {
    const storedAt = Date.parse("2026-08-15T07:00:00Z");
    expect(snapshotCacheState(storedAt, "2026-08-15T10:45:00", tenFortyEight)).toBe(
      "expired",
    );
  });

  it("does not cache stale API responses", () => {
    expect(mixCacheControl("fresh")).toContain("max-age=60");
    expect(mixCacheControl("stale")).toContain("max-age=0");
  });
});
