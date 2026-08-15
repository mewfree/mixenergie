import type { ImportFuelKey, SourceKey } from "../../shared/types.ts";

export const SOURCE_COLOR: Record<SourceKey, string> = {
  hydro: "#009aff",
  wind: "#c2edfe",
  other: "#41c648",
  solar: "#fecc0e",
  thermal: "#f29813",
};

export const IMPORT_COLOR: Record<ImportFuelKey, string> = {
  hydro: "#009aff",
  wind: "#c2edfe",
  solar: "#fecc0e",
  nuclear: "#6d76e8",
  gas: "#ef4e37",
  biomass: "#41c648",
  other: "#7d98b1",
  unknown: "#b5b5b5",
};
