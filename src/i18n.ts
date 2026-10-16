import { PROVINCES } from "../shared/provinces.ts";
import type { ImportFuelKey, MarketKey, ProvinceId, SourceKey } from "../shared/types.ts";

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
  sourcesUrl: string;
  notOfficial: string;
  mw: string;
  provinceLabel: string;
  province: Record<ProvinceId, string>;
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
    sourcesUrl: "https://donnees.hydroquebec.com/",
    notOfficial: "Ce site est indépendant. Il n'est pas un produit d'Hydro-Québec.",
    mw: "MW",
    provinceLabel: "Province",
    province: { qc: "Québec", on: "Ontario" },
    source: {
      hydro: "Hydraulique",
      nuclear: "Nucléaire",
      wind: "Éolien",
      solar: "Solaire",
      biomass: "Biomasse",
      other: "Autres renouvelables",
      gas: "Gaz naturel",
      thermal: "Thermique",
      unclassified: "Non classé",
    },
    sourceHint: {
      hydro: "Centrales d'Hydro-Québec, fournisseurs sous contrat et Churchill Falls.",
      nuclear: "",
      wind: "Producteurs indépendants dont Hydro-Québec achète toute la production.",
      solar: "Parcs solaires d'Hydro-Québec.",
      biomass: "",
      other: "Biomasse, biogaz ou petite hydraulique, estimation.",
      gas: "",
      thermal: "Centrale thermique de Bécancour.",
      unclassified: "",
    },
    market: {
      ontario: "Ontario",
      quebec: "Québec",
      newyork: "New York",
      newengland: "Nouvelle-Angleterre",
      newbrunswick: "Nouveau-Brunswick",
      manitoba: "Manitoba",
      michigan: "Michigan",
      minnesota: "Minnesota",
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
    sourcesUrl: "https://donnees.hydroquebec.com/",
    notOfficial: "This is an independent site. It is not a Hydro-Québec product.",
    mw: "MW",
    provinceLabel: "Province",
    province: { qc: "Québec", on: "Ontario" },
    source: {
      hydro: "Hydro",
      nuclear: "Nuclear",
      wind: "Wind",
      solar: "Solar",
      biomass: "Biomass",
      other: "Other renewables",
      gas: "Natural gas",
      thermal: "Thermal",
      unclassified: "Unclassified",
    },
    sourceHint: {
      hydro: "Hydro-Québec plants, contracted suppliers, and Churchill Falls.",
      nuclear: "",
      wind: "Independent producers whose full output Hydro-Québec buys.",
      solar: "Hydro-Québec solar farms.",
      biomass: "",
      other: "Biomass, biogas or small hydro, estimated.",
      gas: "",
      thermal: "Bécancour thermal generating station.",
      unclassified: "",
    },
    market: {
      ontario: "Ontario",
      quebec: "Québec",
      newyork: "New York",
      newengland: "New England",
      newbrunswick: "New Brunswick",
      manitoba: "Manitoba",
      michigan: "Michigan",
      minnesota: "Minnesota",
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

/** Province-specific copy that replaces the Québec defaults above. */
const ON: Record<Locale, Partial<Dict>> = {
  fr: {
    pageTitle: "mixénergie · Mix énergétique de l'Ontario en direct",
    scope: "Ontario · IESO",
    heroLead: "de l'électricité produite en Ontario est sans émissions en ce moment.",
    delayNote:
      "Données publiées par la Société indépendante d'exploitation du réseau d'électricité (IESO) avec environ une heure de retard.",
    yearHint: "2025 : totaux mensuels publiés par l'IESO, année civile.",
    about:
      "La production additionne, par combustible, les centrales raccordées au marché de l'IESO. Les petites installations intégrées aux réseaux de distribution ne sont pas comptées, ce qui sous-estime surtout le solaire. La demande est la « demande de l'Ontario » de l'IESO, qui exclut les exportations. L'intensité carbone est une moyenne pondérée de médianes de cycle de vie du GIEC (12 g pour le nucléaire, 24 g pour l'hydraulique, 11 g pour l'éolien, 48 g pour le solaire, 230 g pour la biomasse, 490 g pour le gaz).",
    delay:
      "La production est publiée à l'heure, avec environ une heure de retard. La demande est mise à jour toutes les 5 minutes. Les échanges le sont environ à l'heure.",
    license: "Rapports publics de l'IESO, utilisés selon leurs conditions d'utilisation.",
    sourcesLink: "Rapports publics de l'IESO",
    sourcesUrl: "https://www.ieso.ca/power-data",
    notOfficial: "Ce site est indépendant. Il n'est pas un produit de l'IESO.",
    sourceHint: {
      hydro: "Centrales hydroélectriques raccordées au réseau de transport, dont Niagara.",
      nuclear: "Bruce, Darlington et Pickering.",
      wind: "Parcs éoliens raccordés au réseau de transport.",
      solar: "Parcs solaires raccordés au réseau de transport.",
      biomass: "Biocombustibles et biogaz.",
      other: "",
      gas: "Centrales au gaz naturel, dont les centrales de pointe.",
      thermal: "",
      unclassified: "Production que l'IESO classe comme « autre ».",
    },
  },
  en: {
    pageTitle: "mixénergie · Ontario's electricity mix, live",
    scope: "Ontario · IESO",
    heroLead: "of the electricity generated in Ontario is emission-free right now.",
    delayNote:
      "Published by the Independent Electricity System Operator (IESO) with a lag of about an hour.",
    yearHint: "2025: monthly totals published by the IESO, calendar year.",
    about:
      "Generation adds up, by fuel, the plants connected to the IESO-controlled grid. Small facilities embedded in distribution networks are not counted, which mostly understates solar. Demand is the IESO's \"Ontario demand\", which excludes exports. Carbon intensity is a weighted average of IPCC lifecycle medians (12 g for nuclear, 24 g for hydro, 11 g for wind, 48 g for solar, 230 g for biomass, 490 g for gas).",
    delay:
      "Generation is published hourly, with about an hour of lag. Demand updates every 5 minutes. Trade updates about hourly.",
    license: "IESO public reports, used under their terms of use.",
    sourcesLink: "IESO public reports",
    sourcesUrl: "https://www.ieso.ca/power-data",
    notOfficial: "This is an independent site. It is not an IESO product.",
    sourceHint: {
      hydro: "Hydroelectric stations on the transmission grid, including Niagara.",
      nuclear: "Bruce, Darlington and Pickering.",
      wind: "Wind farms connected to the transmission grid.",
      solar: "Solar farms connected to the transmission grid.",
      biomass: "Biofuels and biogas.",
      other: "",
      gas: "Natural gas plants, including peakers.",
      thermal: "",
      unclassified: "Output the IESO classes as \"other\".",
    },
  },
};

const OVERRIDES: Partial<Record<ProvinceId, Record<Locale, Partial<Dict>>>> = { on: ON };

/** Copy for one province and language, with Québec text as the base. */
export function getDict(province: ProvinceId, locale: Locale): Dict {
  const base = dict[locale];
  const override = OVERRIDES[province]?.[locale];
  if (!override) return base;
  return {
    ...base,
    ...override,
    sourceHint: { ...base.sourceHint, ...override.sourceHint },
  };
}

/** Meta description per province and language, for the head tags set at runtime. */
export const DESCRIPTION: Record<ProvinceId, Record<Locale, string>> = {
  qc: {
    fr: "Le mix énergétique du Québec en direct : production, demande et échanges d'Hydro-Québec.",
    en: "Québec's electricity mix, live: generation, demand and trade from Hydro-Québec.",
  },
  on: {
    fr: "Le mix énergétique de l'Ontario en direct : production, demande et échanges de l'IESO.",
    en: "Ontario's electricity mix, live: generation, demand and trade from the IESO.",
  },
};

export type Route = { province: ProvinceId; locale: Locale };

export function routeFromPath(pathname: string): Route {
  const path = pathname.replace(/\/+$/, "") || "/";
  const province = (Object.values(PROVINCES).find(
    (p) => p.prefix !== "" && (path === p.prefix || path.startsWith(`${p.prefix}/`)),
  )?.id ?? "qc") satisfies ProvinceId;
  const rest = path.slice(PROVINCES[province].prefix.length);
  return { province, locale: rest === "/en" || rest.startsWith("/en/") ? "en" : "fr" };
}

export function pathForRoute({ province, locale }: Route): string {
  const { prefix } = PROVINCES[province];
  if (locale === "en") return `${prefix}/en`;
  return prefix === "" ? "/" : prefix;
}

export function apiPath(province: ProvinceId): string {
  return province === "qc" ? "/api/mix" : `/api/mix/${province}`;
}
