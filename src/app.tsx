import { useEffect, useState } from "react";
import type { MixPayload } from "../shared/types.ts";
import { Header } from "./components/header.tsx";
import { MixList } from "./components/mix-list.tsx";
import { SiteFooter } from "./components/site-footer.tsx";
import { StatGrid } from "./components/stat-grid.tsx";
import { TradeCard } from "./components/trade-card.tsx";
import { TrendChart } from "./components/trend-chart.tsx";
import { dict, localeFromPath, pathForLocale, type Locale } from "./i18n.ts";
import { formatHqStamp, formatPct } from "./lib/format.ts";
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
    <div className="min-h-dvh bg-paper text-ink">
      <Header
        locale={locale}
        theme={theme}
        onTheme={setTheme}
        onLocale={(next) => {
          window.history.pushState({}, "", pathForLocale(next));
          setLocale(next);
        }}
      />
      <main className="mx-auto max-w-5xl px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
        <div>
          <p className="kicker flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            {t.live} · {t.scope}
          </p>
          <h1 className="mt-5">
            {data ? (
              <>
                <span className="numeral block text-7xl leading-none sm:text-8xl lg:text-9xl">
                  {formatPct(Math.floor(data.production.renewablePct * 10) / 10, locale)}
                </span>
                <span className="mt-4 block max-w-2xl text-xl font-medium leading-snug tracking-tight sm:text-3xl">
                  {t.heroLead}
                </span>
              </>
            ) : (
              <>
                <span className="sr-only">{t.pageTitle}</span>
                <span className="block h-20 w-72 animate-pulse bg-wash sm:h-28" aria-hidden="true" />
              </>
            )}
          </h1>
          {data ? (
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
              {t.lastUpdate}{" "}
              <span className="font-medium tabular-nums text-ink">
                {formatHqStamp(data.production.at, locale)}
              </span>{" "}
              ({t.easternTime.toLowerCase()}). {t.delayNote}
            </p>
          ) : null}
        </div>

        {!data && !error ? (
          <div className="mt-12 space-y-10" aria-hidden="true">
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse border-t border-ink bg-wash/60" />
              ))}
            </div>
            <div className="h-64 animate-pulse border-t border-ink bg-wash/60" />
          </div>
        ) : null}

        {error && !data ? (
          <div className="mt-12 max-w-md border-l-2 border-caution pl-4">
            <h3 className="text-xl font-semibold">{t.error}</h3>
            <button
              type="button"
              className="mt-2 cursor-pointer text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
              onClick={() => window.location.reload()}
            >
              {t.retry}
            </button>
          </div>
        ) : null}

        {data ? (
          <div className="mt-12 space-y-12 sm:space-y-14">
            <StatGrid locale={locale} data={data} />
            <MixList locale={locale} data={data} />
            <TrendChart locale={locale} data={data} />
            <TradeCard locale={locale} data={data} />
          </div>
        ) : null}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
