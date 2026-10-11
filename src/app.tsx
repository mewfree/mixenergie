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

const REFRESH_MS = 60_000;

export function App() {
  const [locale, setLocale] = useState<Locale>(() => localeFromPath(window.location.pathname));
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [data, setData] = useState<MixPayload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = dict[locale].pageTitle;
  }, [locale]);

  useEffect(() => {
    const onPop = () => setLocale(localeFromPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch("/api/mix", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        setData((await response.json()) as MixPayload);
        setError(false);
      } catch {
        if (!controller.signal.aborted) setError(true);
      }
    }

    const refresh = () => {
      if (!document.hidden) void load();
    };

    refresh();
    const id = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
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
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted">
            <span>QUÉBEC</span>
            <span className="text-line">/</span>
            <span>HYDRO-QUÉBEC</span>
          </div>

          <h1 className="mt-2.5 max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {t.tagline}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted sm:text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <span className="text-line">·</span>
            <span>{t.easternTime}</span>
          </div>
        </div>

        {/* Loading skeleton */}
        {!data && !error ? (
          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl border border-line/60 bg-card p-4"
                />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-xl border border-line/60 bg-card" />
            <div className="h-72 animate-pulse rounded-xl border border-line/60 bg-card" />
          </div>
        ) : null}

        {/* Error state */}
        {error && !data ? (
          <div className="mt-8 rounded-xl border border-line bg-card p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
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
              className="mt-4 cursor-pointer rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper dark:bg-accent dark:text-on-accent transition-opacity hover:opacity-90 active:scale-[0.98]"
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
