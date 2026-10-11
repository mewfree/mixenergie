import {
  intensityGPerKwh,
  isImportFuelKey,
  latestFilled,
  marketNet,
  mergeImportFuels,
  num,
  renewableMw,
  renewablePct,
  sortMarkets,
  sourcesFromUnknown,
  sourceTotal,
  stats,
} from "../shared/mix.ts";
import type {
  DemandPoint,
  ImportFuel,
  MarketFlow,
  MarketKey,
  MixPayload,
  ProductionPoint,
  SourceMw,
  YearMix,
} from "../shared/types.ts";

const HQ = {
  production:
    "https://www.hydroquebec.com/data/documents-donnees/donnees-ouvertes/json/production.json",
  demand:
    "https://www.hydroquebec.com/data/documents-donnees/donnees-ouvertes/json/demande.json",
  trade:
    "https://donnees.solutions.hydroquebec.com/donnees-ouvertes/data/json/importexport.json",
} as const;

const ODS_YEAR =
  "https://donnees.hydroquebec.com/api/explore/v2.1/catalog/datasets/historique-production-electricite-quebec/records?select=sum(hydraulique)%20as%20hydraulique,sum(eolien)%20as%20eolien,sum(autres)%20as%20autres,sum(solaire)%20as%20solaire,sum(thermique)%20as%20thermique,sum(total)%20as%20total&where=date%20%3E%3D%20date%272025-01-01%27%20AND%20date%20%3C%20date%272026-01-01%27&limit=1";

const MARKET_FROM_HQ: Record<string, MarketKey> = {
  Ontario: "ontario",
  NewYork: "newyork",
  NewEngland: "newengland",
  NewBrunswick: "newbrunswick",
};

type HqProductionRow = {
  date?: unknown;
  valeurs?: {
    total?: unknown;
    hydraulique?: unknown;
    eolien?: unknown;
    autres?: unknown;
    solaire?: unknown;
    thermique?: unknown;
  };
};

type HqDemandRow = {
  date?: unknown;
  valeurs?: {
    demandeTotal?: unknown;
  };
};

type HqTradeRow = {
  date?: unknown;
  Exportations?: Record<string, unknown>;
  Importations_Sources?: Record<string, Record<string, unknown> | undefined>;
};

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "mixenergie/0.1 (https://github.com/mewfree/mixenergie)",
    },
    signal: AbortSignal.timeout(10_000),
    cf: { cacheEverything: true, cacheTtl: 60 },
  });
  if (!response.ok) {
    throw new Error(`${url} -> ${response.status}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    // Upstream occasionally serves an HTML page with a 200 status.
    const type = response.headers.get("content-type") ?? "unknown";
    throw new Error(`${url} -> non-JSON response (${type}): ${text.slice(0, 80)}`);
  }
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** HQ wraps every series in `{ details: [...] }`. */
function details<T>(raw: unknown): T[] {
  const rows = (raw as { details?: unknown } | null)?.details;
  return Array.isArray(rows) ? rows : [];
}

function productionPoints(raw: unknown): ProductionPoint[] {
  const points: ProductionPoint[] = [];
  for (const row of details<HqProductionRow>(raw)) {
    const t = asString(row.date);
    const valeurs = row.valeurs ?? {};
    const total = num(valeurs.total);
    if (!t || total <= 0) continue;
    const sources = sourcesFromUnknown(valeurs);
    points.push({ t, total, ...sources });
  }
  return points;
}

function demandPoints(raw: unknown): DemandPoint[] {
  const points: DemandPoint[] = [];
  for (const row of details<HqDemandRow>(raw)) {
    const t = asString(row.date);
    const mw = num(row.valeurs?.demandeTotal);
    if (!t || mw <= 0) continue;
    points.push({ t, mw });
  }
  return points;
}

function parseImportFuels(bag: Record<string, unknown> | undefined): ImportFuel[] {
  if (!bag) return [];
  const fuels: ImportFuel[] = [];
  for (const [rawKey, rawValue] of Object.entries(bag)) {
    if (rawKey === "total") continue;
    if (!isImportFuelKey(rawKey)) continue;
    const mw = num(rawValue);
    if (mw > 0.05) fuels.push({ key: rawKey, mw });
  }
  return fuels;
}

function parseTrade(raw: unknown): MixPayload["trade"] {
  const row = latestFilled(details<HqTradeRow>(raw), (item) => {
    const exports = item.Exportations ?? {};
    const imports = item.Importations_Sources ?? {};
    const exportTotal = num(exports.total);
    const importTotal = Object.values(imports).reduce(
      (sum, market) => sum + num(market?.total),
      0,
    );
    return exportTotal > 0 || importTotal > 0;
  });
  if (!row) return null;

  const t = asString(row.date);
  if (!t) return null;

  const markets: MarketFlow[] = [];
  const fuelGroups: ImportFuel[][] = [];
  let exportTotal = 0;
  let importTotal = 0;

  for (const [hqKey, marketKey] of Object.entries(MARKET_FROM_HQ)) {
    const imports = row.Importations_Sources?.[hqKey];
    const net = marketNet(num(row.Exportations?.[hqKey]));
    const listedImport = num(imports?.total);
    const importMw = listedImport > 0 ? listedImport : net.importMw;
    exportTotal += net.exportMw;
    importTotal += importMw;
    markets.push({ key: marketKey, exportMw: net.exportMw, importMw });
    fuelGroups.push(parseImportFuels(imports));
  }

  return {
    at: t,
    exportTotal,
    importTotal,
    net: exportTotal - importTotal,
    markets: sortMarkets(markets),
    importFuels: mergeImportFuels(fuelGroups),
  };
}

function parseYear(raw: unknown): YearMix | null {
  const row = (raw as { results?: Array<Record<string, unknown>> } | null)?.results?.[0];
  if (!row) return null;
  const sources: SourceMw = sourcesFromUnknown(row);
  const total = num(row.total) || sourceTotal(sources);
  if (total <= 0) return null;
  return {
    year: 2025,
    totalMwh: total,
    sources,
    renewablePct: renewablePct(sources, total),
  };
}

export async function loadYear(): Promise<YearMix | null> {
  try {
    return parseYear(await getJson(ODS_YEAR));
  } catch {
    return null;
  }
}

export async function loadMix(year: YearMix | null): Promise<MixPayload> {
  const [productionRaw, demandRaw, tradeRaw] = await Promise.all([
    getJson(HQ.production),
    getJson(HQ.demand),
    getJson(HQ.trade),
  ]);

  const productionSeries = productionPoints(productionRaw);
  const demandSeries = demandPoints(demandRaw);
  const current = latestFilled(productionSeries, (p) => p.total > 0);
  if (!current) {
    throw new Error("no production data");
  }

  const { t: productionAt, total, ...sources } = current;
  const demandNow = latestFilled(demandSeries, (d) => d.mw > 0);

  return {
    fetchedAt: new Date().toISOString(),
    timezone: "America/Toronto",
    production: {
      at: productionAt,
      total,
      sources,
      renewableMw: renewableMw(sources),
      renewablePct: renewablePct(sources, total),
      intensity: intensityGPerKwh(sources, total),
    },
    demand: demandNow
      ? {
          at: demandNow.t,
          mw: demandNow.mw,
          ...stats(demandSeries.map((d) => d.mw)),
        }
      : null,
    trade: parseTrade(tradeRaw),
    series: {
      production: productionSeries,
      demand: demandSeries,
    },
    year,
    notes: {
      productionDelay: "90min",
      demandDelay: "15min",
    },
  };
}
