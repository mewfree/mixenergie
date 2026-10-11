import type { ImportFuelKey, MarketKey, SourceKey } from "../shared/types.ts";

export type Locale = "fr" | "en";

type Dict = {
  title: string;
  pageTitle: string;
  scope: string;
  heroLead: string;
  lastUpdate: string;
  easternTime: string;
  delayNote: string;
  live: string;
  renewableShort: string;
  production: string;
  demand: string;
  intensity: string;
  intensityUnit: string;
  intensityRef: string;
  low: string;
  high: string;
  net: string;
  netExporter: string;
  netImporter: string;
  balanced: string;
  sources: string;
  nowCol: string;
  yearCol: string;
  yearHint: string;
  total: string;
  lastHours: string;
  scrubHint: string;
  surplus: string;
  deficit: string;
  trade: string;
  exports: string;
  imports: string;
  totalExported: string;
  totalImported: string;
  importOrigin: string;
  exporting: string;
  importing: string;
  retry: string;
  error: string;
  aboutTitle: string;
  about: string;
  delay: string;
  legalTitle: string;
  license: string;
  sourcesLink: string;
  notOfficial: string;
  mw: string;
  source: Record<SourceKey, string>;
  sourceHint: Record<SourceKey, string>;
  market: Record<MarketKey, string>;
  importFuel: Record<ImportFuelKey, string>;
};

export const dict: Record<Locale, Dict> = {
  fr: {
    title: "mixénergie",
    pageTitle: "mixénergie · Mix énergétique du Québec en direct",
    scope: "Québec · Hydro-Québec",
    heroLead: "de l'électricité produite au Québec est renouvelable en ce moment.",
    lastUpdate: "Mesure de",
    easternTime: "Heure de l'Est",
    delayNote: "Données publiées par Hydro-Québec avec environ 90 minutes de retard.",
    live: "En direct",
    renewableShort: "renouvelables",
    production: "Production",
    demand: "Demande",
    intensity: "Intensité carbone",
    intensityUnit: "g CO₂éq/kWh",
    intensityRef: "Gaz naturel : {g} g/kWh",
    low: "min. 48 h",
    high: "max. 48 h",
    net: "Solde net",
    netExporter: "Exportateur net",
    netImporter: "Importateur net",
    balanced: "Équilibré",
    sources: "D'où vient l'électricité",
    nowCol: "Maintenant",
    yearCol: "2025",
    yearHint: "2025 : somme horaire sur l'année civile, données historiques.",
    total: "Total",
    lastHours: "Production et demande, 48 h",
    scrubHint: "Glisser sur le graphique pour inspecter",
    surplus: "Surplus",
    deficit: "Déficit",
    trade: "Échanges avec les réseaux voisins",
    exports: "Exportations",
    imports: "Importations",
    totalExported: "Total exporté",
    totalImported: "Total importé",
    importOrigin: "Provenance des importations",
    exporting: "Exporte",
    importing: "Importe",
    retry: "Réessayer",
    error: "Impossible de charger les données.",
    aboutTitle: "À propos des données",
    about:
      "La production vient des centrales d'Hydro-Québec et des producteurs indépendants liés par contrat, plus Churchill Falls. La demande est calculée par le Centre de conduite du réseau, hors réseaux autonomes. L'intensité carbone est une moyenne pondérée des facteurs de cycle de vie d'Hydro-Québec (28 g pour l'hydraulique, 14 g pour l'éolien, 64 g pour le solaire, 608 g pour le thermique).",
    delay:
      "La production est publiée à la demie de l'heure, avec un délai d'environ 90 minutes (6 heures pour le thermique). La demande est mise à jour toutes les 15 minutes.",
    legalTitle: "Sources et mentions",
    license: "Licence CC BY-NC 4.0. Données brutes, sans garantie de qualité.",
    sourcesLink: "Données ouvertes Hydro-Québec",
    notOfficial: "Ce site est indépendant. Il n'est pas un produit d'Hydro-Québec.",
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
    pageTitle: "mixénergie · Québec's electricity mix, live",
    scope: "Québec · Hydro-Québec",
    heroLead: "of the electricity generated in Québec is renewable right now.",
    lastUpdate: "Reading from",
    easternTime: "Eastern Time",
    delayNote: "Published by Hydro-Québec with a lag of about 90 minutes.",
    live: "Live",
    renewableShort: "renewable",
    production: "Generation",
    demand: "Demand",
    intensity: "Carbon intensity",
    intensityUnit: "g CO₂e/kWh",
    intensityRef: "Natural gas: {g} g/kWh",
    low: "48 h low",
    high: "48 h high",
    net: "Net",
    netExporter: "Net exporter",
    netImporter: "Net importer",
    balanced: "Balanced",
    sources: "Where the power comes from",
    nowCol: "Now",
    yearCol: "2025",
    yearHint: "2025: hourly sum over the calendar year, historical dataset.",
    total: "Total",
    lastHours: "Generation and demand, 48 h",
    scrubHint: "Scrub across chart to inspect",
    surplus: "Surplus",
    deficit: "Deficit",
    trade: "Trade with neighbouring grids",
    exports: "Exports",
    imports: "Imports",
    totalExported: "Total exported",
    totalImported: "Total imported",
    importOrigin: "Where imports come from",
    exporting: "Exporting",
    importing: "Importing",
    retry: "Try again",
    error: "Could not load the data.",
    aboutTitle: "About the data",
    about:
      "Generation covers Hydro-Québec plants, contracted independent producers, and Churchill Falls. Demand is computed by the system control centre and excludes off-grid networks. Carbon intensity is a weighted average of Hydro-Québec lifecycle factors (28 g for hydro, 14 g for wind, 64 g for solar, 608 g for thermal).",
    delay:
      "Generation is published on the half hour, with about a 90 minute lag (6 hours for thermal). Demand updates every 15 minutes.",
    legalTitle: "Sources and legal",
    license: "CC BY-NC 4.0 licence. Raw data, no quality guarantee.",
    sourcesLink: "Hydro-Québec open data",
    notOfficial: "This is an independent site. It is not a Hydro-Québec product.",
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
