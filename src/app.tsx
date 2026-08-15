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
    <div className="min-h-dvh bg-paper text-ink">
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
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-accent">
          Québec
        </p>
        <h1 className="mt-2 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.tagline}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {t.updated}
          {data ? ` · ${t.easternTime}` : ""}
        </p>

        {loading && !data ? (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        ) : null}

        {error && !data ? (
          <div className="mt-8 rounded-2xl border border-line bg-card p-6">
            <p className="text-ink">{t.error}</p>
            <button
              type="button"
              className="mt-3 cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-medium text-on-accent"
              onClick={() => window.location.reload()}
            >
              {t.retry}
            </button>
          </div>
        ) : null}

        {data ? (
          <div className="mt-8 space-y-5">
            <StatGrid locale={locale} data={data} />
            <MixList locale={locale} data={data} />
            <TrendChart locale={locale} data={data} />
            <div className="grid gap-5 lg:grid-cols-2">
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
