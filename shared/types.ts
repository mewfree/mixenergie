export const SOURCE_KEYS = [
  "hydro",
  "wind",
  "other",
  "solar",
  "thermal",
] as const;

export type SourceKey = (typeof SOURCE_KEYS)[number];

export const IMPORT_FUEL_KEYS = [
  "hydro",
  "wind",
  "solar",
  "nuclear",
  "gas",
  "biomass",
  "other",
  "unknown",
] as const;

export type ImportFuelKey = (typeof IMPORT_FUEL_KEYS)[number];

export const MARKET_KEYS = [
  "ontario",
  "newyork",
  "newengland",
  "newbrunswick",
] as const;

export type MarketKey = (typeof MARKET_KEYS)[number];

export type SourceMw = Record<SourceKey, number>;

export type ProductionPoint = {
  t: string;
  total: number;
} & SourceMw;

export type DemandPoint = {
  t: string;
  mw: number;
};

export type MarketFlow = {
  key: MarketKey;
  exportMw: number;
  importMw: number;
};

export type ImportFuel = {
  key: ImportFuelKey;
  mw: number;
};

export type YearMix = {
  year: number;
  totalMwh: number;
  sources: SourceMw;
  renewablePct: number;
};

export type MixPayload = {
  fetchedAt: string;
  timezone: "America/Toronto";
  production: {
    at: string;
    total: number;
    sources: SourceMw;
    renewableMw: number;
    renewablePct: number;
    intensity: number;
  };
  demand: {
    at: string;
    mw: number;
    low: number;
    high: number;
    avg: number;
  } | null;
  trade: {
    at: string;
    exportTotal: number;
    importTotal: number;
    net: number;
    markets: MarketFlow[];
    importFuels: ImportFuel[];
  } | null;
  series: {
    production: ProductionPoint[];
    demand: DemandPoint[];
  };
  year: YearMix | null;
  notes: {
    productionDelay: string;
    demandDelay: string;
  };
};

export type MixError = {
  error: string;
};
