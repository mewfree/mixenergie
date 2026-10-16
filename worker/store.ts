import {
  cacheAge,
  hqDataAgeMs,
  kvKeys,
  KV_READ_CACHE_TTL,
  LOCK_TTL_SECONDS,
  snapshotCacheState,
  SNAPSHOT_TTL_SECONDS,
  YEAR_FRESH_MS,
  YEAR_TTL_SECONDS,
  type CacheState,
} from "../shared/cache.ts";
import { PROVINCES } from "../shared/provinces.ts";
import type { MixPayload, ProvinceId, YearMix } from "../shared/types.ts";
import * as hq from "./hq.ts";
import * as aeso from "./aeso.ts";
import * as ieso from "./ieso.ts";
import { logError } from "./log.ts";

type Loader = {
  loadMix(env: Env, year: YearMix | null): Promise<MixPayload>;
  loadYear(): Promise<YearMix | null>;
};

const LOADERS: Record<ProvinceId, Loader> = {
  qc: { loadMix: (_env, year) => hq.loadMix(year), loadYear: hq.loadYear },
  on: ieso,
  ab: aeso,
};

type SnapshotMeta = { storedAt: number };
type YearRecord = { storedAt: number; year: YearMix };

export type MixResult = {
  payload: MixPayload;
  state: CacheState | "miss";
  ageSeconds: number;
};

function metaTime(metadata: unknown, fallbackIso?: string): number {
  if (metadata && typeof metadata === "object" && "storedAt" in metadata) {
    const value = (metadata as SnapshotMeta).storedAt;
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  if (fallbackIso) {
    const parsed = Date.parse(fallbackIso);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export async function readSnapshot(env: Env, province: ProvinceId): Promise<{
  payload: MixPayload;
  storedAt: number;
} | null> {
  const result = await env.MIX.getWithMetadata<MixPayload>(kvKeys(province).snapshot, {
    type: "json",
    cacheTtl: KV_READ_CACHE_TTL,
  });
  if (!result.value) return null;
  return {
    payload: result.value,
    storedAt: metaTime(result.metadata, result.value.fetchedAt),
  };
}

async function writeSnapshot(
  env: Env,
  province: ProvinceId,
  payload: MixPayload,
  storedAt: number,
): Promise<void> {
  await env.MIX.put(kvKeys(province).snapshot, JSON.stringify(payload), {
    expirationTtl: SNAPSHOT_TTL_SECONDS,
    metadata: { storedAt } satisfies SnapshotMeta,
  });
}

async function readYear(env: Env, province: ProvinceId): Promise<YearRecord | null> {
  return env.MIX.get<YearRecord>(kvKeys(province).year, {
    type: "json",
    cacheTtl: 3600,
  });
}

async function writeYear(env: Env, province: ProvinceId, record: YearRecord): Promise<void> {
  await env.MIX.put(kvKeys(province).year, JSON.stringify(record), {
    expirationTtl: YEAR_TTL_SECONDS,
  });
}

async function acquireLock(env: Env, province: ProvinceId): Promise<boolean> {
  const { lock } = kvKeys(province);
  const existing = await env.MIX.get(lock);
  if (existing) return false;
  await env.MIX.put(lock, String(Date.now()), { expirationTtl: LOCK_TTL_SECONDS });
  return true;
}

async function resolveYear(env: Env, province: ProvinceId): Promise<YearMix | null> {
  const cached = await readYear(env, province);
  if (cached && cacheAge(cached.storedAt) < YEAR_FRESH_MS) {
    return cached.year;
  }

  const fresh = await LOADERS[province].loadYear();
  if (fresh) {
    await writeYear(env, province, { storedAt: Date.now(), year: fresh });
    return fresh;
  }
  return cached?.year ?? null;
}

export async function refreshMix(env: Env, province: ProvinceId): Promise<MixPayload> {
  const year = await resolveYear(env, province);
  const payload = await LOADERS[province].loadMix(env, year);
  await writeSnapshot(env, province, payload, Date.now());
  return payload;
}

function ageSeconds(storedAt: number): number {
  return Math.round(cacheAge(storedAt) / 1000);
}

export async function serveMix(
  env: Env,
  ctx: ExecutionContext,
  province: ProvinceId,
): Promise<MixResult> {
  const { demandIntervalMs: intervalMs, timezone } = PROVINCES[province];
  const cached = await readSnapshot(env, province);
  if (cached) {
    // Only a live demand cadence lets us judge freshness from the data itself.
    const demandAt = intervalMs ? cached.payload.demand?.at : undefined;
    const state = snapshotCacheState(
      cached.storedAt,
      demandAt,
      Date.now(),
      timezone,
      intervalMs ?? undefined,
    );
    const age = ageSeconds(cached.storedAt);
    if (state === "fresh") {
      return { payload: cached.payload, state, ageSeconds: age };
    }
    if (state === "stale") {
      const demandAge = demandAt ? hqDataAgeMs(demandAt, Date.now(), timezone) : 0;
      if (intervalMs && demandAge >= 2 * intervalMs) {
        // Data is badly out of date: wait for a refresh instead of serving it.
        const fresh = await refreshIfUnlocked(env, province);
        if (fresh) return { payload: fresh, state: "miss", ageSeconds: 0 };
      } else {
        ctx.waitUntil(refreshIfUnlocked(env, province));
      }
      return { payload: cached.payload, state, ageSeconds: age };
    }
  }

  try {
    const payload = await refreshMix(env, province);
    return { payload, state: "miss", ageSeconds: 0 };
  } catch (error) {
    if (!cached) throw error;
    return {
      payload: cached.payload,
      state: "stale",
      ageSeconds: ageSeconds(cached.storedAt),
    };
  }
}

async function refreshIfUnlocked(env: Env, province: ProvinceId): Promise<MixPayload | null> {
  let locked = false;
  try {
    locked = await acquireLock(env, province);
    if (!locked) return null;
    return await refreshMix(env, province);
  } catch (error) {
    logError(`background ${province} mix refresh failed`, error);
    return null;
  } finally {
    if (locked) {
      try {
        await env.MIX.delete(kvKeys(province).lock);
      } catch {
        // lock expires via TTL
      }
    }
  }
}
