import type { ImportFuelKey, MarketKey, SourceKey } from "../shared/types.ts";

export type Locale = "fr" | "en";

type Dict = {
  title: string;
  tagline: string;
  updated: string;
  production: string;
  demand: string;
  renewable: string;
  intensity: string;
  intensityUnit: string;
  sources: string;
  lastHours: string;
  trade: string;
  exports: string;
  imports: string;
  net: string;
  yearTitle: string;
  yearHint: string;
  low: string;
  avg: string;
  high: string;
  retry: string;
  error: string;
  loading: string;
  aboutTitle: string;
  about: string;
  delay: string;
  license: string;
  sourcesLink: string;
  notOfficial: string;
  easternTime: string;
  mw: string;
  source: Record<SourceKey, string>;
  sourceHint: Record<SourceKey, string>;
  market: Record<MarketKey, string>;
  importFuel: Record<ImportFuelKey, string>;
};

export const dict: Record<Locale, Dict> = {
  fr: {
    title: "mixénergie",
    tagline: "Le mix énergétique du Québec, en direct.",
    updated: "Données d'Hydro-Québec",
    production: "Production",
    demand: "Demande",
    renewable: "Renouvelable",
    intensity: "Intensité GES",
    intensityUnit: "g/kWh",
    sources: "Sources",
    lastHours: "48 dernières heures",
    trade: "Échanges",
    exports: "Exportations",
    imports: "Importations",
    net: "Solde net",
    yearTitle: "Mix 2025",
    yearHint: "Somme horaire sur l'année civile, données historiques.",
    low: "min",
    avg: "moy",
    high: "max",
    retry: "Réessayer",
    error: "Impossible de charger les données.",
    loading: "Chargement du mix…",
    aboutTitle: "À propos des données",
    about:
      "La production vient des centrales d'Hydro-Québec et des producteurs indépendants liés par contrat, plus Churchill Falls. La demande est calculée par le Centre de conduite du réseau, hors réseaux autonomes. L'intensité GES est une moyenne pondérée des facteurs de cycle de vie d'Hydro-Québec (28 g pour l'hydraulique, 14 g pour l'éolien, 64 g pour le solaire, 608 g pour le thermique).",
    delay:
      "La production est publiée à la demie de l'heure, avec un délai d'environ 90 minutes (6 heures pour le thermique). La demande est mise à jour toutes les 15 minutes.",
    license: "Licence CC BY-NC 4.0. Données brutes, sans garantie de qualité.",
    sourcesLink: "Données ouvertes Hydro-Québec",
    notOfficial:
      "Ce site est indépendant. Il n'est pas un produit d'Hydro-Québec.",
    easternTime: "Heure de l'Est",
    mw: "MW",
    source: {
      hydro: "Hydraulique",
      wind: "Éolien",
      other: "Autres renouvelables",
      solar: "Solaire",
      thermal: "Thermique",
    },
    sourceHint: {
      hydro: "Centrales d'Hydro-Québec, fournisseurs sous contrat et Churchill Falls.",
      wind: "Producteurs indépendants dont Hydro-Québec achète toute la production.",
      other: "Biomasse, biogaz ou petite hydraulique, estimation.",
      solar: "Parcs solaires d'Hydro-Québec.",
      thermal: "Centrale thermique de Bécancour.",
    },
    market: {
      ontario: "Ontario",
      newyork: "New York",
      newengland: "Nouvelle-Angleterre",
      newbrunswick: "Nouveau-Brunswick",
    },
    importFuel: {
      hydro: "Hydraulique",
      wind: "Éolien",
      solar: "Solaire",
      nuclear: "Nucléaire",
      gas: "Gaz",
      biomass: "Biomasse",
      other: "Autre",
      unknown: "Non identifié",
    },
  },
  en: {
    title: "mixénergie",
    tagline: "Québec's electricity mix, live.",
    updated: "Hydro-Québec data",
    production: "Generation",
    demand: "Demand",
    renewable: "Renewable",
    intensity: "GHG intensity",
    intensityUnit: "g/kWh",
    sources: "Sources",
    lastHours: "Last 48 hours",
    trade: "Interties",
    exports: "Exports",
    imports: "Imports",
    net: "Net",
    yearTitle: "2025 mix",
    yearHint: "Hourly sum over the calendar year, historical dataset.",
    low: "low",
    avg: "avg",
    high: "high",
    retry: "Try again",
    error: "Could not load the data.",
    loading: "Loading the mix…",
    aboutTitle: "About the data",
    about:
      "Generation covers Hydro-Québec plants, contracted independent producers, and Churchill Falls. Demand is computed by the system control centre and excludes off-grid networks. GHG intensity is a weighted average of Hydro-Québec lifecycle factors (28 g for hydro, 14 g for wind, 64 g for solar, 608 g for thermal).",
    delay:
      "Generation is published on the half hour, with about a 90 minute lag (6 hours for thermal). Demand updates every 15 minutes.",
    license: "CC BY-NC 4.0 licence. Raw data, no quality guarantee.",
    sourcesLink: "Hydro-Québec open data",
    notOfficial: "This is an independent site. It is not a Hydro-Québec product.",
    easternTime: "Eastern Time",
    mw: "MW",
    source: {
      hydro: "Hydro",
      wind: "Wind",
      other: "Other renewables",
      solar: "Solar",
      thermal: "Thermal",
    },
    sourceHint: {
      hydro: "Hydro-Québec plants, contracted suppliers, and Churchill Falls.",
      wind: "Independent producers whose full output Hydro-Québec buys.",
      other: "Biomass, biogas or small hydro, estimated.",
      solar: "Hydro-Québec solar farms.",
      thermal: "Bécancour thermal generating station.",
    },
    market: {
      ontario: "Ontario",
      newyork: "New York",
      newengland: "New England",
      newbrunswick: "New Brunswick",
    },
    importFuel: {
      hydro: "Hydro",
      wind: "Wind",
      solar: "Solar",
      nuclear: "Nuclear",
      gas: "Gas",
      biomass: "Biomass",
      other: "Other",
      unknown: "Unknown",
    },
  },
};

export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr";
}

export function pathForLocale(locale: Locale): string {
  return locale === "en" ? "/en" : "/";
}
