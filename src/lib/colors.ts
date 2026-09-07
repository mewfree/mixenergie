import type { ImportFuelKey, SourceKey } from "../../shared/types.ts";

export const SOURCE_COLOR: Record<SourceKey, string> = {
  hydro: "#0284c7",
  wind: "#0d9488",
  other: "#16a34a",
  solar: "#eab308",
  thermal: "#ea580c",
};

export const IMPORT_COLOR: Record<ImportFuelKey, string> = {
  hydro: "#0284c7",
  wind: "#0d9488",
  solar: "#eab308",
  nuclear: "#7c3aed",
  gas: "#dc2626",
  biomass: "#16a34a",
  other: "#64748b",
  unknown: "#94a3b8",
};
