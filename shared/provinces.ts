import type { MarketKey, ProvinceId, SourceKey } from "./types.ts";

export type ProvinceConfig = {
  id: ProvinceId;
  /** URL prefix of the French page; the English page is `${prefix}/en`. */
  prefix: string;
  /** IANA zone of the timestamps in this province's payload. */
  timezone: "America/Toronto" | "America/Edmonton";
  /** Sources shown on the page, in display order. */
  sources: SourceKey[];
  renewable: SourceKey[];
  lowCarbon: SourceKey[];
  /** Lifecycle g CO2eq/kWh. Sources without a factor are left out of the average. */
  lca: Partial<Record<SourceKey, number>>;
  /** Fuel quoted next to the intensity figure. */
  referenceFuel: SourceKey;
  markets: MarketKey[];
  /** Cadence of the demand series; null when it is not a fixed live interval. */
  demandIntervalMs: number | null;
  /** Which share the hero figure shows. */
  hero: "renewable" | "lowCarbon";
};

export const PROVINCES: Record<ProvinceId, ProvinceConfig> = {
  qc: {
    id: "qc",
    timezone: "America/Toronto",
    prefix: "",
    sources: ["hydro", "wind", "other", "solar", "thermal"],
    renewable: ["hydro", "wind", "other", "solar"],
    lowCarbon: ["hydro", "wind", "other", "solar"],
    // Lifecycle factors published by Hydro-Québec. "other" is an estimate for
    // independent biomass, biogas and small hydro; thermal is Bécancour (gas).
    lca: { hydro: 28, wind: 14, solar: 64, other: 45, thermal: 608 },
    referenceFuel: "thermal",
    markets: ["ontario", "newyork", "newengland", "newbrunswick"],
    demandIntervalMs: 15 * 60 * 1000,
    hero: "renewable",
  },
  on: {
    id: "on",
    timezone: "America/Toronto",
    prefix: "/on",
    sources: ["nuclear", "hydro", "gas", "wind", "solar", "biomass", "unclassified"],
    renewable: ["hydro", "wind", "solar", "biomass"],
    lowCarbon: ["nuclear", "hydro", "wind", "solar", "biomass"],
    // IPCC AR5 lifecycle medians (utility-scale PV, combined-cycle gas).
    lca: { nuclear: 12, hydro: 24, wind: 11, solar: 48, biomass: 230, gas: 490 },
    referenceFuel: "gas",
    markets: ["quebec", "newyork", "manitoba", "michigan", "minnesota"],
    demandIntervalMs: null,
    hero: "lowCarbon",
  },
  ab: {
    id: "ab",
    timezone: "America/Edmonton",
    prefix: "/ab",
    sources: [
      "cogeneration",
      "combinedCycle",
      "wind",
      "gasSteam",
      "simpleCycle",
      "hydro",
      "solar",
      "storage",
      "unclassified",
    ],
    renewable: ["hydro", "wind", "solar"],
    lowCarbon: ["hydro", "wind", "solar"],
    // IPCC AR5 lifecycle medians. Every gas-fired group uses the combined-cycle
    // figure. Storage and "other" have no factor and are left out.
    lca: {
      hydro: 24,
      wind: 11,
      solar: 48,
      cogeneration: 490,
      combinedCycle: 490,
      gasSteam: 490,
      simpleCycle: 490,
    },
    referenceFuel: "combinedCycle",
    markets: ["britishcolumbia", "saskatchewan", "montana"],
    // The supply-demand report refreshes about every minute.
    demandIntervalMs: 10 * 60 * 1000,
    hero: "renewable",
  },
};

export function isProvinceId(value: string): value is ProvinceId {
  return value in PROVINCES;
}
