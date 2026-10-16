import {
  emptySources,
  intensityGPerKwh,
  latestFilled,
  lowCarbonMw,
  lowCarbonPct,
  marketNet,
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

const CSD_URL =
  "http://ets.aeso.ca/ets_web/ip/Market/Reports/CSDReportServlet?contentType=csv";

const KV_HISTORY = "mix:ab:history";
const HISTORY_TTL_SECONDS = 3 * 24 * 60 * 60;
const WINDOW_MS = 48 * 60 * 60 * 1000;
/** Keep one point per ten minutes; cron runs more often than that. */
const MIN_GAP_MS = 9 * 60 * 1000;

const GROUP_TO_SOURCE: Record<string, SourceKey> = {
  COGENERATION: "cogeneration",
  "COMBINED CYCLE": "combinedCycle",
  WIND: "wind",
  "GAS FIRED STEAM": "gasSteam",
  "SIMPLE CYCLE": "simpleCycle",
  HYDRO: "hydro",
  SOLAR: "solar",
  "ENERGY STORAGE": "storage",
  OTHER: "unclassified",
};

const PATH_TO_MARKET: Record<string, MarketKey> = {
  "BRITISH COLUMBIA": "britishcolumbia",
  MONTANA: "montana",
  SASKATCHEWAN: "saskatchewan",
};

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

export type Csd = {
  /** Mountain wall-clock stamp, "2026-10-15T18:46:00". */
  at: string;
  loadMw: number;
  netGenerationMw: number;
  sources: SourceMw;
  /** Net flow per path, positive meaning export from Alberta. */
  interchange: Partial<Record<MarketKey, number>>;
};

function cells(line: string): string[] {
  return [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1] ?? "");
}

/** "Oct 15, 2026 18:46" to an ISO-like wall-clock stamp. */
export function parseUpdateStamp(text: string): string | null {
  const match = /([A-Za-z]{3})[a-z]* (\d{1,2}), (\d{4}) (\d{1,2}):(\d{2})/.exec(text);
  if (!match) return null;
  const month = MONTHS.indexOf((match[1] ?? "").toLowerCase());
  if (month < 0) return null;
  const pad = (value: string | undefined) => String(value ?? "").padStart(2, "0");
  return `${match[3]}-${pad(String(month + 1))}-${pad(match[2])}T${pad(match[4])}:${match[5]}:00`;
}

/** Parse the report's summary, generation groups and interchange blocks. */
export function parseCsd(csv: string): Csd | null {
  let at: string | null = null;
  let load = 0;
  let netGeneration = 0;
  const sources = emptySources();
  const interchange: Partial<Record<MarketKey, number>> = {};
  const seen = new Set<SourceKey>();
  let groupsDone = false;

  for (const line of csv.split("\n")) {
    if (line.startsWith("\"Last Update")) {
      at = parseUpdateStamp(line);
      continue;
    }
    const row = cells(line);
    const name = (row[0] ?? "").trim();
    if (!name) continue;
    const upper = name.toUpperCase();
    const first = Number((row[1] ?? "").replaceAll(",", ""));

    if (name === "Alberta Internal Load (AIL)") load = first;
    else if (name === "Alberta Total Net Generation") netGeneration = first;

    if (!groupsDone && row.length >= 3) {
      const key = GROUP_TO_SOURCE[upper];
      const tng = Number((row[2] ?? "").replaceAll(",", ""));
      if (key && !seen.has(key) && Number.isFinite(tng)) {
        sources[key] = tng > 0 ? tng : 0;
        seen.add(key);
      }
      // The group table ends at its TOTAL row, before the per-asset tables.
      if (upper === "TOTAL" && seen.size > 0) groupsDone = true;
    }

    const market = PATH_TO_MARKET[upper];
    if (market && Number.isFinite(first) && interchange[market] === undefined) {
      interchange[market] = first;
    }
  }

  if (!at || seen.size === 0) return null;
  return { at, loadMw: load, netGenerationMw: netGeneration, sources, interchange };
}

type History = {
  production: ProductionPoint[];
  demand: DemandPoint[];
};

function wallMs(stamp: string): number {
  return Date.parse(`${stamp.slice(0, 19)}Z`);
}

function append<T extends { t: string }>(points: T[], next: T | null): T[] {
  const out = [...points];
  const last = out[out.length - 1];
  if (next) {
    if (!last || wallMs(next.t) - wallMs(last.t) >= MIN_GAP_MS) out.push(next);
    else if (last && next.t > last.t) out[out.length - 1] = next;
  }
  const newest = out.length ? wallMs(out[out.length - 1]?.t ?? "") : 0;
  return out.filter((p) => wallMs(p.t) > newest - WINDOW_MS);
}

async function readHistory(env: Env): Promise<History> {
  try {
    const stored = await env.MIX.get<History>(KV_HISTORY, { type: "json" });
    if (stored?.production && stored.demand) return stored;
  } catch (error) {
    logError("aeso history read failed", error);
  }
  return { production: [], demand: [] };
}

export function tradeFromCsd(csd: Csd): MixPayload["trade"] {
  const markets: MarketFlow[] = [];
  let exportTotal = 0;
  let importTotal = 0;
  for (const key of PROVINCES.ab.markets) {
    const flow = csd.interchange[key];
    if (flow === undefined) continue;
    const split = marketNet(flow);
    exportTotal += split.exportMw;
    importTotal += split.importMw;
    markets.push({ key, ...split });
  }
  if (markets.length === 0) return null;
  return {
    at: csd.at,
    exportTotal,
    importTotal,
    net: exportTotal - importTotal,
    markets: sortMarkets(markets),
    importFuels: [],
  };
}

export async function loadYear(): Promise<YearMix | null> {
  // The supply-demand report has no annual breakdown.
  return null;
}

export async function loadMix(env: Env, year: YearMix | null): Promise<MixPayload> {
  const response = await fetch(CSD_URL, {
    headers: { "User-Agent": "mixenergie/0.1 (https://github.com/mewfree/mixenergie)" },
    signal: AbortSignal.timeout(15_000),
    cf: { cacheEverything: true, cacheTtl: 30 },
  });
  if (!response.ok) {
    throw new Error(`${CSD_URL} -> ${response.status}`);
  }
  const csd = parseCsd(await response.text());
  if (!csd) {
    throw new Error("aeso supply-demand report not parseable");
  }

  const total = sourceTotal(csd.sources);
  const point: ProductionPoint | null =
    total > 0 ? { t: csd.at, total, ...csd.sources } : null;
  const demandPoint: DemandPoint | null =
    csd.loadMw > 0 ? { t: csd.at, mw: csd.loadMw } : null;

  const history = await readHistory(env);
  const production = append(history.production, point);
  const demand = append(history.demand, demandPoint);
  try {
    await env.MIX.put(KV_HISTORY, JSON.stringify({ production, demand }), {
      expirationTtl: HISTORY_TTL_SECONDS,
    });
  } catch (error) {
    logError("aeso history write failed", error);
  }

  const current = latestFilled(production, (p) => p.total > 0);
  if (!current) {
    throw new Error("no production data");
  }
  const { t: productionAt, total: currentTotal, ...sources } = current;
  const demandNow = latestFilled(demand, (d) => d.mw > 0);

  return {
    province: "ab",
    fetchedAt: new Date().toISOString(),
    timezone: "America/Edmonton",
    production: {
      at: productionAt,
      total: currentTotal,
      sources,
      renewableMw: renewableMw(sources, "ab"),
      renewablePct: renewablePct(sources, "ab", currentTotal),
      lowCarbonMw: lowCarbonMw(sources, "ab"),
      lowCarbonPct: lowCarbonPct(sources, "ab", currentTotal),
      intensity: intensityGPerKwh(sources, "ab"),
    },
    demand: demandNow
      ? { at: demandNow.t, mw: demandNow.mw, ...stats(demand.map((d) => d.mw)) }
      : null,
    trade: tradeFromCsd(csd),
    series: { production, demand },
    year,
    notes: {
      productionDelay: "1min",
      demandDelay: "1min",
    },
  };
}
