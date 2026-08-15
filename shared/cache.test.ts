import { describe, expect, it } from "vitest";
import { cacheAge, cacheState } from "./cache.ts";

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
