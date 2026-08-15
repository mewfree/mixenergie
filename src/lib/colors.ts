import type { ImportFuelKey, SourceKey } from "../../shared/types.ts";

export const SOURCE_COLOR: Record<SourceKey, string> = {
  hydro: "#0a6d74",
  wind: "#3b82b0",
  other: "#3f8a55",
  solar: "#d4921a",
  thermal: "#c0563a",
};

export const IMPORT_COLOR: Record<ImportFuelKey, string> = {
  hydro: "#0a6d74",
  wind: "#3b82b0",
  solar: "#d4921a",
  nuclear: "#7c6bb0",
  gas: "#c0563a",
  biomass: "#3f8a55",
  other: "#6b7280",
  unknown: "#9ca3af",
};
