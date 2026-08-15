import type { Locale } from "../i18n.ts";

const localeTag = (locale: Locale) => (locale === "fr" ? "fr-CA" : "en-CA");

export function formatMw(value: number, locale: Locale, digits = 0): string {
  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Math.round(value * 10 ** digits) / 10 ** digits);
}

export function formatPct(value: number, locale: Locale): string {
  if (value > 0 && value < 0.05) return locale === "fr" ? "< 0,1 %" : "< 0.1%";
  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 1,
    minimumFractionDigits: value >= 10 ? 0 : 1,
  }).format(value) + (locale === "fr" ? " %" : "%");
}

export function formatG(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatHqStamp(value: string, locale: Locale): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const monthName = new Intl.DateTimeFormat(localeTag(locale), {
    month: "long",
    timeZone: "UTC",
  }).format(date);
  if (locale === "fr") {
    return `${Number(day)} ${monthName} ${year}, ${Number(hour)} h ${minute}`;
  }
  return `${monthName} ${Number(day)}, ${year}, ${hour}:${minute}`;
}

export function formatHqHour(value: string, locale: Locale): string {
  const match = /T(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const [, hour, minute] = match;
  if (locale === "fr") return `${Number(hour)} h ${minute}`;
  return `${hour}:${minute}`;
}

export function formatSignedMw(value: number, locale: Locale): string {
  const abs = formatMw(Math.abs(value), locale);
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return abs;
}
