import { PROVINCES } from "./provinces.ts";
import {
  IMPORT_FUEL_KEYS,
  MARKET_KEYS,
  SOURCE_KEYS,
  type ImportFuel,
  type ImportFuelKey,
  type MarketFlow,
  type ProvinceId,
  type SourceKey,
  type SourceMw,
} from "./types.ts";

export function emptySources(): SourceMw {
  return Object.fromEntries(SOURCE_KEYS.map((key) => [key, 0])) as SourceMw;
}

export function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function clampZero(value: number): number {
  return value > 0 ? value : 0;
}

export function sourcesFromUnknown(raw: {
  hydraulique?: unknown;
  eolien?: unknown;
  autres?: unknown;
  solaire?: unknown;
  thermique?: unknown;
}): SourceMw {
  return {
    ...emptySources(),
    hydro: clampZero(num(raw.hydraulique)),
    wind: clampZero(num(raw.eolien)),
    other: clampZero(num(raw.autres)),
    solar: clampZero(num(raw.solaire)),
    thermal: clampZero(num(raw.thermique)),
  };
}

export function sourceTotal(sources: SourceMw): number {
  return SOURCE_KEYS.reduce((sum, key) => sum + sources[key], 0);
}

function sumKeys(sources: SourceMw, keys: SourceKey[]): number {
  return keys.reduce((sum, key) => sum + sources[key], 0);
}

export function renewableMw(sources: SourceMw, province: ProvinceId): number {
  return sumKeys(sources, PROVINCES[province].renewable);
}

export function renewablePct(
  sources: SourceMw,
  province: ProvinceId,
  total = sourceTotal(sources),
): number {
  return pct(renewableMw(sources, province), total);
}

export function lowCarbonMw(sources: SourceMw, province: ProvinceId): number {
  return sumKeys(sources, PROVINCES[province].lowCarbon);
}

export function lowCarbonPct(
  sources: SourceMw,
  province: ProvinceId,
  total = sourceTotal(sources),
): number {
  return pct(lowCarbonMw(sources, province), total);
}

/** Weighted lifecycle intensity over the sources that have a published factor. */
export function intensityGPerKwh(sources: SourceMw, province: ProvinceId): number {
  const { lca } = PROVINCES[province];
  let weighted = 0;
  let covered = 0;
  for (const key of SOURCE_KEYS) {
    const factor = lca[key];
    if (factor === undefined) continue;
    weighted += sources[key] * factor;
    covered += sources[key];
  }
  return covered > 0 ? weighted / covered : 0;
}

export function pct(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

export function latestFilled<T>(
  items: T[],
  hasData: (item: T) => boolean,
): T | null {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    const item = items[i];
    if (item && hasData(item)) return item;
  }
  return null;
}

export function stats(values: number[]): { low: number; high: number; avg: number } {
  if (values.length === 0) return { low: 0, high: 0, avg: 0 };
  let low = values[0] ?? 0;
  let high = values[0] ?? 0;
  let sum = 0;
  for (const value of values) {
    if (value < low) low = value;
    if (value > high) high = value;
    sum += value;
  }
  return { low, high, avg: sum / values.length };
}

export function marketNet(exportMw: number): { exportMw: number; importMw: number } {
  if (exportMw >= 0) return { exportMw, importMw: 0 };
  return { exportMw: 0, importMw: Math.abs(exportMw) };
}

export function mergeImportFuels(groups: ImportFuel[][]): ImportFuel[] {
  const bag = Object.fromEntries(IMPORT_FUEL_KEYS.map((key) => [key, 0])) as Record<
    ImportFuelKey,
    number
  >;
  for (const group of groups) {
    for (const fuel of group) {
      bag[fuel.key] += fuel.mw;
    }
  }
  return IMPORT_FUEL_KEYS.map((key) => ({ key, mw: bag[key] })).filter((f) => f.mw > 0.05);
}

export function sortMarkets(markets: MarketFlow[]): MarketFlow[] {
  const order = new Map(MARKET_KEYS.map((key, i) => [key, i]));
  return [...markets].sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0));
}

export function isImportFuelKey(value: string): value is ImportFuelKey {
  return (IMPORT_FUEL_KEYS as readonly string[]).includes(value);
}
