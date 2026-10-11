import type { Locale } from "../i18n.ts";

const TAGS: Record<Locale, string> = { fr: "fr-CA", en: "en-CA" };

/** Intl formatters are costly to construct; build each one once per locale. */
function perLocale<T>(make: (tag: string) => T): Record<Locale, T> {
  return { fr: make(TAGS.fr), en: make(TAGS.en) };
}

const integer = perLocale((tag) => new Intl.NumberFormat(tag, { maximumFractionDigits: 0 }));
const percentWhole = perLocale(
  (tag) => new Intl.NumberFormat(tag, { maximumFractionDigits: 1, minimumFractionDigits: 0 }),
);
const percentTenths = perLocale(
  (tag) => new Intl.NumberFormat(tag, { maximumFractionDigits: 1, minimumFractionDigits: 1 }),
);
const compact = perLocale(
  (tag) =>
    new Intl.NumberFormat(tag, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 0,
    }),
);
const monthName = perLocale(
  (tag) => new Intl.DateTimeFormat(tag, { month: "long", timeZone: "UTC" }),
);

const STAMP = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

/** Splits an HQ Eastern wall-clock stamp ("2026-08-15T10:45:00") into its parts. */
export function parseHqStamp(value: string) {
  const match = STAMP.exec(value);
  if (!match) return null;
  const [, year = "", month = "", day = "", hour = "", minute = ""] = match;
  return { year, month, day, hour, minute };
}

export function formatMw(value: number, locale: Locale): string {
  return integer[locale].format(value);
}

export const formatG = formatMw;

export function formatPct(value: number, locale: Locale): string {
  if (value > 0 && value < 0.05) return locale === "fr" ? "< 0,1 %" : "< 0.1%";
  const format = value >= 10 ? percentWhole : percentTenths;
  return format[locale].format(value) + (locale === "fr" ? " %" : "%");
}

export function formatHqStamp(value: string, locale: Locale): string {
  const p = parseHqStamp(value);
  if (!p) return value;
  const month = monthName[locale].format(new Date(Date.UTC(Number(p.year), Number(p.month) - 1)));
  if (locale === "fr") {
    return `${Number(p.day)} ${month} ${p.year}, ${Number(p.hour)} h ${p.minute}`;
  }
  return `${month} ${Number(p.day)}, ${p.year}, ${p.hour}:${p.minute}`;
}

export function formatHqHour(value: string, locale: Locale): string {
  const p = parseHqStamp(value);
  if (!p) return value;
  return locale === "fr" ? `${Number(p.hour)} h ${p.minute}` : `${p.hour}:${p.minute}`;
}

export function formatHqTick(value: string, locale: Locale): string {
  const p = parseHqStamp(value);
  if (!p) return value;
  const time = formatHqHour(value, locale);
  if (locale === "fr") return `${Number(p.day)}/${p.month} ${time}`;
  return `${Number(p.month)}/${Number(p.day)} ${time}`;
}

export function formatMwCompact(value: number, locale: Locale): string {
  if (value === 0) return "0";
  return compact[locale].format(value);
}

export function formatSignedMw(value: number, locale: Locale): string {
  const abs = formatMw(Math.abs(value), locale);
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return abs;
}
