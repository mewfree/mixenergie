import {
  IMPORT_FUEL_KEYS,
  MARKET_KEYS,
  SOURCE_KEYS,
  type ImportFuel,
  type ImportFuelKey,
  type MarketFlow,
  type MarketKey,
  type SourceKey,
  type SourceMw,
} from "./types.ts";

/** Lifecycle GHG factors published by Hydro-Québec, g CO2eq / kWh. */
export const LCA_G_PER_KWH: Record<SourceKey, number> = {
  hydro: 28,
  wind: 14,
  solar: 64,
  /** Estimate for independent biomass, biogas and small hydro. */
  other: 45,
  /** Bécancour thermal station, treated as natural gas. */
  thermal: 608,
};

export const IMPORT_LCA_G_PER_KWH: Record<ImportFuelKey, number> = {
  hydro: 28,
  wind: 14,
  solar: 64,
  nuclear: 8,
  gas: 608,
  biomass: 45,
  other: 200,
  unknown: 400,
};

export const RENEWABLE_KEYS: SourceKey[] = ["hydro", "wind", "other", "solar"];

export function emptySources(): SourceMw {
  return { hydro: 0, wind: 0, other: 0, solar: 0, thermal: 0 };
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

export function renewableMw(sources: SourceMw): number {
  return RENEWABLE_KEYS.reduce((sum, key) => sum + sources[key], 0);
}

export function renewablePct(sources: SourceMw, total = sourceTotal(sources)): number {
  if (total <= 0) return 0;
  return (renewableMw(sources) / total) * 100;
}

export function intensityGPerKwh(sources: SourceMw, total = sourceTotal(sources)): number {
  if (total <= 0) return 0;
  const weighted = SOURCE_KEYS.reduce(
    (sum, key) => sum + sources[key] * LCA_G_PER_KWH[key],
    0,
  );
  return weighted / total;
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

export function sumImportFuels(fuels: ImportFuel[]): number {
  return fuels.reduce((sum, fuel) => sum + fuel.mw, 0);
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

export function isMarketKey(value: string): value is MarketKey {
  return (MARKET_KEYS as readonly string[]).includes(value);
}

export function isSourceKey(value: string): value is SourceKey {
  return (SOURCE_KEYS as readonly string[]).includes(value);
}
