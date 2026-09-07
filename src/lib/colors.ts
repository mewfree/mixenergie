import type { ImportFuelKey, SourceKey } from "../../shared/types.ts";

export const SOURCE_COLOR: Record<SourceKey, string> = {
  hydro: "#009aff",
  wind: "#06b6d4",
  other: "#10b981",
  solar: "#f59e0b",
  thermal: "#f97316",
};

export const IMPORT_COLOR: Record<ImportFuelKey, string> = {
  hydro: "#009aff",
  wind: "#06b6d4",
  solar: "#f59e0b",
  nuclear: "#8b5cf6",
  gas: "#ef4444",
  biomass: "#10b981",
  other: "#64748b",
  unknown: "#94a3b8",
};
