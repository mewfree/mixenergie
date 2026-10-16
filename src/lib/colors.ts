import type { ImportFuelKey, SourceKey } from "../../shared/types.ts";

export const SOURCE_COLOR: Record<SourceKey, string> = {
  hydro: "#24608f",
  nuclear: "#6b5b95",
  wind: "#4a918c",
  solar: "#c9a43a",
  biomass: "#78a05e",
  other: "#78a05e",
  gas: "#b4572b",
  thermal: "#b4572b",
  cogeneration: "#8c3f1f",
  combinedCycle: "#b4572b",
  gasSteam: "#cf7a4d",
  simpleCycle: "#e0a07a",
  storage: "#6b5b95",
  unclassified: "#8a8a84",
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
