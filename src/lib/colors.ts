import type { ImportFuelKey, SourceKey } from "../../shared/types.ts";

export const SOURCE_COLOR: Record<SourceKey, string> = {
  hydro: "#24608f",
  wind: "#4a918c",
  other: "#78a05e",
  solar: "#c9a43a",
  thermal: "#b4572b",
};

export const IMPORT_COLOR: Record<ImportFuelKey, string> = {
  hydro: "#24608f",
  wind: "#4a918c",
  solar: "#c9a43a",
  nuclear: "#6b5b95",
  gas: "#b4572b",
  biomass: "#78a05e",
  other: "#8a8a84",
  unknown: "#b9b8b0",
};
