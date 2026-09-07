import { useEffect, useState } from "react";
import type { MixPayload } from "../shared/types.ts";
import { Header } from "./components/header.tsx";
import { MixList } from "./components/mix-list.tsx";
import { SiteFooter } from "./components/site-footer.tsx";
import { StatGrid } from "./components/stat-grid.tsx";
import { TradeCard } from "./components/trade-card.tsx";
import { TrendChart } from "./components/trend-chart.tsx";
import { YearCard } from "./components/year-card.tsx";
import { dict, localeFromPath, pathForLocale, type Locale } from "./i18n.ts";
import { formatHqStamp } from "./lib/format.ts";
import { applyTheme, readTheme, type Theme } from "./lib/theme.ts";

export function App() {
  const [locale, setLocale] = useState<Locale>(() =>
    typeof window === "undefined" ? "fr" : localeFromPath(window.location.pathname),
  );
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "light" : readTheme(),
  );
  const [data, setData] = useState<MixPayload | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title =
      locale === "fr"
        ? "mixénergie · Mix énergétique du Québec"
        : "mixénergie · Québec electricity mix";
    const onPop = () => setLocale(localeFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [locale]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch("/api/mix", { cache: "no-store" });
        if (!response.ok) throw new Error(String(response.status));
        const payload = (await response.json()) as MixPayload;
        if (!cancelled) setData(payload);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const t = dict[locale];

  return (
    <div className="min-h-dvh bg-paper text-ink transition-colors duration-200">
      <Header
        locale={locale}
        theme={theme}
        onTheme={setTheme}
        onLocale={(next) => {
          const path = pathForLocale(next);
          window.history.pushState({}, "", path);
          setLocale(next);
        }}
      />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Québec · Hydro-Québec
          </div>

          <h1 className="mt-3.5 max-w-2xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {t.tagline}
          </h1>

          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted sm:text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {data ? (
                <span>
                  {t.lastUpdate} : <strong className="font-semibold text-ink">{formatHqStamp(data.production.at, locale)}</strong>
                </span>
              ) : (
                t.updated
              )}
            </span>
            <span>·</span>
            <span>{t.easternTime}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {locale === "fr" ? "Flux officiel" : "Official feed"}
            </span>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && !data ? (
          <div className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-2xl border border-line/60 bg-card p-4 shadow-xs"
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl border border-line/60 bg-card shadow-xs" />
            <div className="h-72 animate-pulse rounded-2xl border border-line/60 bg-card shadow-xs" />
          </div>
        ) : null}

        {/* Error state */}
        {error && !data ? (
          <div className="mt-8 rounded-2xl border border-line bg-card p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              <div>
                <h3 className="font-bold text-ink">{t.error}</h3>
                <p className="mt-0.5 text-xs text-muted">{t.retry}</p>
              </div>
            </div>
            <button
              type="button"
              className="mt-4 cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent shadow-sm shadow-accent/25 transition-transform active:scale-95"
              onClick={() => window.location.reload()}
            >
              {t.retry}
            </button>
          </div>
        ) : null}

        {/* Main content */}
        {data ? (
          <div className="mt-8 space-y-6 sm:space-y-7">
            <StatGrid locale={locale} data={data} />
            <MixList locale={locale} data={data} />
            <TrendChart locale={locale} data={data} />
            <div className="grid gap-6 lg:grid-cols-2">
              <TradeCard locale={locale} data={data} />
              <YearCard locale={locale} data={data} />
            </div>
          </div>
        ) : null}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
