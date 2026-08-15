import {
  cacheState,
  DEMAND_INTERVAL_MS,
  hqDataAgeMs,
  KV_LOCK,
  KV_READ_CACHE_TTL,
  KV_SNAPSHOT,
  KV_YEAR,
  LOCK_TTL_SECONDS,
  snapshotCacheState,
  SNAPSHOT_TTL_SECONDS,
  YEAR_FRESH_MS,
  YEAR_TTL_SECONDS,
  type CacheState,
} from "../shared/cache.ts";
import type { MixPayload, YearMix } from "../shared/types.ts";
import { loadMix, loadYear } from "./hq.ts";

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

export async function readSnapshot(env: Env): Promise<{
  payload: MixPayload;
  storedAt: number;
} | null> {
  const result = await env.MIX.getWithMetadata<MixPayload>(KV_SNAPSHOT, {
    type: "json",
    cacheTtl: KV_READ_CACHE_TTL,
  });
  if (!result.value) return null;
  return {
    payload: result.value,
    storedAt: metaTime(result.metadata, result.value.fetchedAt),
  };
}

async function writeSnapshot(env: Env, payload: MixPayload, storedAt: number): Promise<void> {
  await env.MIX.put(KV_SNAPSHOT, JSON.stringify(payload), {
    expirationTtl: SNAPSHOT_TTL_SECONDS,
    metadata: { storedAt } satisfies SnapshotMeta,
  });
}

async function readYear(env: Env): Promise<YearRecord | null> {
  return env.MIX.get<YearRecord>(KV_YEAR, {
    type: "json",
    cacheTtl: 3600,
  });
}

async function writeYear(env: Env, record: YearRecord): Promise<void> {
  await env.MIX.put(KV_YEAR, JSON.stringify(record), {
    expirationTtl: YEAR_TTL_SECONDS,
  });
}

async function acquireLock(env: Env): Promise<boolean> {
  const existing = await env.MIX.get(KV_LOCK);
  if (existing) return false;
  await env.MIX.put(KV_LOCK, String(Date.now()), { expirationTtl: LOCK_TTL_SECONDS });
  return true;
}

async function resolveYear(env: Env): Promise<YearMix | null> {
  const cached = await readYear(env);
  if (cached && cacheState(cached.storedAt, YEAR_FRESH_MS, YEAR_TTL_SECONDS * 1000) === "fresh") {
    return cached.year;
  }

  const fresh = await loadYear();
  if (fresh) {
    await writeYear(env, { storedAt: Date.now(), year: fresh });
    return fresh;
  }
  return cached?.year ?? null;
}

export async function refreshMix(env: Env): Promise<MixPayload> {
  const year = await resolveYear(env);
  const payload = await loadMix(year);
  const storedAt = Date.now();
  await writeSnapshot(env, payload, storedAt);
  return payload;
}

export async function serveMix(env: Env, ctx: ExecutionContext): Promise<MixResult> {
  const cached = await readSnapshot(env);
  if (cached) {
    const state = snapshotCacheState(cached.storedAt, cached.payload.demand?.at);
    const ageSeconds = Math.round((Date.now() - cached.storedAt) / 1000);
    if (state === "fresh") {
      return { payload: cached.payload, state, ageSeconds };
    }
    if (state === "stale") {
      try {
        const demandAge = cached.payload.demand
          ? hqDataAgeMs(cached.payload.demand.at)
          : 0;
        if (demandAge >= 2 * DEMAND_INTERVAL_MS) {
          const fresh = await refreshIfUnlocked(env);
          if (fresh) return { payload: fresh, state: "miss", ageSeconds: 0 };
        } else {
          ctx.waitUntil(refreshIfUnlocked(env));
        }
      } catch (error) {
        console.error(
          JSON.stringify({
            message: "stale mix refresh failed",
            error: error instanceof Error ? error.message : String(error),
          }),
        );
      }
      return { payload: cached.payload, state, ageSeconds };
    }
  }

  try {
    const payload = await refreshMix(env);
    return { payload, state: "miss", ageSeconds: 0 };
  } catch (error) {
    if (cached) {
      return {
        payload: cached.payload,
        state: "stale",
        ageSeconds: Math.round((Date.now() - cached.storedAt) / 1000),
      };
    }
    throw error;
  }
}

async function refreshIfUnlocked(env: Env): Promise<MixPayload | null> {
  let locked = false;
  try {
    locked = await acquireLock(env);
    if (!locked) return null;
    return await refreshMix(env);
  } catch (error) {
    console.error(
      JSON.stringify({
        message: "background mix refresh failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return null;
  } finally {
    if (locked) {
      try {
        await env.MIX.delete(KV_LOCK);
      } catch {
        // lock expires via TTL
      }
    }
  }
}
