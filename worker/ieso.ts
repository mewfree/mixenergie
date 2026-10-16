import { wallClockIso } from "../shared/cache.ts";
import {
  emptySources,
  intensityGPerKwh,
  latestFilled,
  lowCarbonMw,
  lowCarbonPct,
  marketNet,
  num,
  renewableMw,
  renewablePct,
  sortMarkets,
  sourceTotal,
  stats,
} from "../shared/mix.ts";
import { PROVINCES } from "../shared/provinces.ts";
import type {
  DemandPoint,
  MarketFlow,
  MarketKey,
  MixPayload,
  ProductionPoint,
  SourceKey,
  SourceMw,
  YearMix,
} from "../shared/types.ts";
import { logError } from "./log.ts";

const BASE = "https://reports-public.ieso.ca/public";

const IESO = {
  capability: `${BASE}/GenOutputCapability/PUB_GenOutputCapability.xml`,
  capabilityDay: (yyyymmdd: string) =>
    `${BASE}/GenOutputCapability/PUB_GenOutputCapability_${yyyymmdd}.xml`,
  demand: `${BASE}/Demand/PUB_Demand.csv`,
  realtime: `${BASE}/RealtimeTotals/PUB_RealtimeTotals.xml`,
  realtimeHour: (yyyymmddhh: string) =>
    `${BASE}/RealtimeTotals/PUB_RealtimeTotals_${yyyymmddhh}.xml`,
  intertie: `${BASE}/IntertieScheduleFlow/PUB_IntertieScheduleFlow.xml`,
  monthly: (year: number) =>
    `${BASE}/GenOutputbyFuelMonthly/PUB_GenOutputbyFuelMonthly_${year}.xml`,
} as const;

const YEAR = 2025;
const HOUR_MS = 60 * 60 * 1000;
const WINDOW_HOURS = 48;
/** IESO stamps everything in Eastern Standard Time, with no daylight saving. */
const EST_OFFSET_HOURS = 5;
const MAX_ARCHIVE_FETCHES = 10;
const ARCHIVE_TTL_SECONDS = 3 * 24 * 60 * 60;

const FUEL_TO_SOURCE: Record<string, SourceKey> = {
  NUCLEAR: "nuclear",
  GAS: "gas",
  HYDRO: "hydro",
  WIND: "wind",
  SOLAR: "solar",
  BIOFUEL: "biomass",
  OTHER: "unclassified",
};

function sourceFromFuel(fuel: string): SourceKey | null {
  return FUEL_TO_SOURCE[fuel.trim().toUpperCase()] ?? null;
}

/** IESO zone name to the neighbouring market it connects to. */
function marketFromZone(zone: string): MarketKey | null {
  const name = zone.trim().toUpperCase();
  if (name.startsWith("PQ.")) return "quebec";
  // "MANITOBA SK" is the Saskatchewan path through Manitoba; it is small.
  if (name.startsWith("MANITOBA")) return "manitoba";
  if (name === "MICHIGAN") return "michigan";
  if (name === "MINNESOTA") return "minnesota";
  if (name === "NEW-YORK") return "newyork";
  return null;
}

async function getText(url: string, cacheTtl = 60): Promise<string> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/xml, text/csv",
      "User-Agent": "mixenergie/0.1 (https://github.com/mewfree/mixenergie)",
    },
    signal: AbortSignal.timeout(15_000),
    cf: { cacheEverything: true, cacheTtl },
  });
  if (!response.ok) {
    throw new Error(`${url} -> ${response.status}`);
  }
  return response.text();
}

/** UTC milliseconds of the start of an IESO hour (hour-ending `hour` EST). */
export function hourStartMs(date: string, hour: number, minutes = 0): number {
  const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d, hour - 1 + EST_OFFSET_HOURS, minutes);
}

/** Eastern wall-clock stamp ("2026-10-15T20:00:00"), matching what HQ publishes. */
export function easternStamp(ms: number): string {
  return wallClockIso(ms, "America/Toronto") ?? new Date(ms).toISOString().slice(0, 19);
}

function estDateOf(ms: number): { date: string; hour: number } {
  const shifted = new Date(ms - EST_OFFSET_HOURS * HOUR_MS);
  const date = shifted.toISOString().slice(0, 10);
  return { date, hour: shifted.getUTCHours() + 1 };
}

function compactDate(date: string): string {
  return date.replaceAll("-", "");
}

function firstTag(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(xml);
  return match?.[1] ?? null;
}

type HourOutput = { hour: number; sources: SourceMw; generators: number };

/** Sum per-generator hourly output by fuel. Only reported hours appear. */
export function parseCapability(xml: string): { date: string; hours: HourOutput[] } {
  const date = firstTag(xml, "Date") ?? "";
  const byHour = new Map<number, HourOutput>();

  for (const block of xml.split("<Generator>").slice(1)) {
    const key = sourceFromFuel(firstTag(block, "FuelType") ?? "");
    if (!key) continue;
    const outputs = block.split("<Outputs>")[1]?.split("</Outputs>")[0] ?? "";
    for (const match of outputs.matchAll(
      /<Hour>(\d+)<\/Hour>\s*<EnergyMW>([^<]*)<\/EnergyMW>/g,
    )) {
      const hour = Number(match[1]);
      const mw = Number(match[2]);
      if (!Number.isFinite(mw)) continue;
      let entry = byHour.get(hour);
      if (!entry) {
        entry = { hour, sources: emptySources(), generators: 0 };
        byHour.set(hour, entry);
      }
      entry.sources[key] += mw > 0 ? mw : 0;
      entry.generators += 1;
    }
  }

  const hours = [...byHour.values()].sort((a, b) => a.hour - b.hour);
  // The newest hour can be half reported while generators are still posting.
  const last = hours[hours.length - 1];
  const before = hours[hours.length - 2];
  if (last && before && last.generators < before.generators * 0.9) hours.pop();
  return { date, hours };
}

export function productionPoints(xml: string): ProductionPoint[] {
  const { date, hours } = parseCapability(xml);
  if (!date) return [];
  const points: ProductionPoint[] = [];
  for (const { hour, sources } of hours) {
    const total = sourceTotal(sources);
    if (total <= 0) continue;
    points.push({ t: easternStamp(hourStartMs(date, hour)), total, ...sources });
  }
  return points;
}

/** Ontario Demand rows of the yearly CSV, as hour-start timestamps. */
export function parseDemandCsv(csv: string): { ms: number; mw: number }[] {
  const rows: { ms: number; mw: number }[] = [];
  for (const line of csv.split("\n")) {
    const match = /^(\d{4}-\d{2}-\d{2}),(\d+),([\d.]+),([\d.]+)\s*$/.exec(line);
    if (!match) continue;
    const mw = Number(match[4]);
    if (!(mw > 0)) continue;
    rows.push({ ms: hourStartMs(match[1] ?? "", Number(match[2])), mw });
  }
  return rows;
}

type RealtimeInterval = { ms: number; mw: number };

export function parseRealtime(xml: string): RealtimeInterval[] {
  const date = firstTag(xml, "DeliveryDate");
  const hour = Number(firstTag(xml, "DeliveryHour"));
  if (!date || !Number.isFinite(hour)) return [];
  const intervals: RealtimeInterval[] = [];
  for (const block of xml.split("<IntervalEnergy>").slice(1)) {
    const interval = Number(firstTag(block, "Interval"));
    const match = /<MarketQuantity>ONTARIO DEMAND<\/MarketQuantity>\s*<EnergyMW>([^<]*)</.exec(
      block,
    );
    const mw = Number(match?.[1]);
    if (!Number.isFinite(interval) || !(mw > 0)) continue;
    intervals.push({ ms: hourStartMs(date, hour, (interval - 1) * 5), mw });
  }
  return intervals;
}

type ZoneFlow = { zone: string; hour: number; interval: number; flow: number };

/** Latest 5-minute actual flow for each intertie zone. Positive is export. */
export function parseIntertie(xml: string): { date: string; zones: ZoneFlow[] } {
  const date = firstTag(xml, "Date") ?? "";
  const zones: ZoneFlow[] = [];
  for (const block of xml.split("<IntertieZone>").slice(1)) {
    const zone = firstTag(block, "IntertieZoneName");
    const actuals = block.split("<Actuals>")[1] ?? "";
    let latest: ZoneFlow | null = null;
    for (const match of actuals.matchAll(
      /<Hour>(\d+)<\/Hour>\s*<Interval>(\d+)<\/Interval>\s*<Flow>([^<]*)<\/Flow>/g,
    )) {
      const flow = Number(match[3]);
      if (!zone || !Number.isFinite(flow)) continue;
      latest = { zone, hour: Number(match[1]), interval: Number(match[2]), flow };
    }
    if (latest) zones.push(latest);
  }
  return { date, zones };
}

export function tradeFromIntertie(xml: string): MixPayload["trade"] {
  const { date, zones } = parseIntertie(xml);
  const known = zones.filter((z) => marketFromZone(z.zone) !== null);
  if (!date || known.length === 0) return null;

  const newest = known.reduce((a, b) =>
    b.hour * 100 + b.interval > a.hour * 100 + a.interval ? b : a,
  );
  const net = new Map<MarketKey, number>();
  for (const zone of known) {
    const key = marketFromZone(zone.zone);
    if (key) net.set(key, (net.get(key) ?? 0) + zone.flow);
  }

  const markets: MarketFlow[] = [];
  let exportTotal = 0;
  let importTotal = 0;
  for (const key of PROVINCES.on.markets) {
    const split = marketNet(net.get(key) ?? 0);
    exportTotal += split.exportMw;
    importTotal += split.importMw;
    markets.push({ key, ...split });
  }

  return {
    at: easternStamp(hourStartMs(date, newest.hour, (newest.interval - 1) * 5)),
    exportTotal,
    importTotal,
    net: exportTotal - importTotal,
    markets: sortMarkets(markets),
    importFuels: [],
  };
}

export function parseMonthly(xml: string): YearMix | null {
  const sources = emptySources();
  for (const block of xml.split("<FuelTotal>").slice(1)) {
    const key = sourceFromFuel(firstTag(block, "Fuel") ?? "");
    const gwh = num(Number(firstTag(block, "EnergyGW")));
    if (key) sources[key] += gwh * 1000;
  }
  const total = sourceTotal(sources);
  if (total <= 0) return null;
  return {
    year: YEAR,
    totalMwh: total,
    sources,
    renewablePct: renewablePct(sources, "on", total),
  };
}

export async function loadYear(): Promise<YearMix | null> {
  try {
    return parseMonthly(await getText(IESO.monthly(YEAR), 3600));
  } catch {
    return null;
  }
}

/**
 * The daily demand CSV lags by most of a day, so the hours since its last row
 * come from the hourly real-time archives. A finished hour never changes, so
 * each one is fetched once and kept in KV.
 */
async function archivedHourDemand(env: Env, ms: number): Promise<number | null> {
  const { date, hour } = estDateOf(ms);
  const stamp = `${compactDate(date)}${String(hour).padStart(2, "0")}`;
  const key = `mix:on:rt:${stamp}`;
  const cached = await env.MIX.get(key);
  if (cached) return Number(cached);

  try {
    const intervals = parseRealtime(await getText(IESO.realtimeHour(stamp), 3600));
    if (intervals.length === 0) return null;
    const mw = intervals.reduce((sum, i) => sum + i.mw, 0) / intervals.length;
    await env.MIX.put(key, String(mw), { expirationTtl: ARCHIVE_TTL_SECONDS });
    return mw;
  } catch {
    return null;
  }
}

async function demandSeries(env: Env): Promise<DemandPoint[]> {
  const [csv, realtime] = await Promise.all([
    getText(IESO.demand, 300).then(parseDemandCsv, () => []),
    getText(IESO.realtime).then(parseRealtime, () => []),
  ]);

  const byMs = new Map<number, number>();
  for (const row of csv) byMs.set(row.ms, row.mw);

  const latest = realtime[realtime.length - 1];
  if (latest) {
    const currentHour = latest.ms - (latest.ms % HOUR_MS);
    const lastCsv = csv.length > 0 ? Math.max(...csv.map((r) => r.ms)) : 0;
    const first = Math.max(lastCsv + HOUR_MS, currentHour - (WINDOW_HOURS - 1) * HOUR_MS);
    const missing: number[] = [];
    for (let ms = first; ms < currentHour; ms += HOUR_MS) missing.push(ms);

    const fetched = await Promise.all(
      missing.slice(-MAX_ARCHIVE_FETCHES).map(async (ms) => [ms, await archivedHourDemand(env, ms)] as const),
    );
    for (const [ms, mw] of fetched) {
      if (mw != null && mw > 0) byMs.set(ms, mw);
    }
    byMs.set(latest.ms, latest.mw);
  }

  const newest = Math.max(0, ...byMs.keys());
  return [...byMs.entries()]
    .filter(([ms]) => ms > newest - WINDOW_HOURS * HOUR_MS)
    .sort((a, b) => a[0] - b[0])
    .map(([ms, mw]) => ({ t: easternStamp(ms), mw }));
}

function previousDate(date: string): string {
  const [y = 0, m = 1, d = 1] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

export async function loadMix(env: Env, year: YearMix | null): Promise<MixPayload> {
  const todayXml = await getText(IESO.capability);
  const today = parseCapability(todayXml);
  const yesterdayXml = today.date
    ? await getText(IESO.capabilityDay(compactDate(previousDate(today.date))), 3600).catch(
        (error: unknown) => {
          logError("ieso previous-day capability failed", error);
          return "";
        },
      )
    : "";

  const [demand, tradeXml] = await Promise.all([
    demandSeries(env),
    getText(IESO.intertie).catch(() => ""),
  ]);

  const production = [
    ...(yesterdayXml ? productionPoints(yesterdayXml) : []),
    ...productionPoints(todayXml),
  ].sort((a, b) => a.t.localeCompare(b.t));

  const current = latestFilled(production, (p) => p.total > 0);
  if (!current) {
    throw new Error("no production data");
  }

  const { t: productionAt, total, ...sources } = current;
  const demandNow = latestFilled(demand, (d) => d.mw > 0);

  return {
    province: "on",
    fetchedAt: new Date().toISOString(),
    timezone: "America/Toronto",
    production: {
      at: productionAt,
      total,
      sources,
      renewableMw: renewableMw(sources, "on"),
      renewablePct: renewablePct(sources, "on", total),
      lowCarbonMw: lowCarbonMw(sources, "on"),
      lowCarbonPct: lowCarbonPct(sources, "on", total),
      intensity: intensityGPerKwh(sources, "on"),
    },
    demand: demandNow
      ? {
          at: demandNow.t,
          mw: demandNow.mw,
          ...stats(demand.map((d) => d.mw)),
        }
      : null,
    trade: tradeXml ? tradeFromIntertie(tradeXml) : null,
    series: { production, demand },
    year,
    notes: {
      productionDelay: "1h",
      demandDelay: "5min",
    },
  };
}
