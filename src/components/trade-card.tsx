import { pct } from "../../shared/mix.ts";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { IMPORT_COLOR } from "../lib/colors.ts";
import { formatHqStamp, formatMw, formatPct, formatSignedMw } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

export function TradeCard({ locale, data }: Props) {
  const t = dict[locale];
  const trade = data.trade;
  if (!trade) return null;

  const isNetExport = trade.net > 0;
  const isNetImport = trade.net < 0;

  return (
    <section className="flex flex-col justify-between rounded-xl border border-line/70 bg-card p-5 sm:p-6 transition-colors">
      <div>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{t.trade}</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                  isNetExport
                    ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : isNetImport
                      ? "border border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                      : "border border-line bg-paper text-muted"
                }`}
              >
                {isNetExport ? "↗ " + t.netExporter : isNetImport ? "↙ " + t.netImporter : t.balanced}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{formatHqStamp(trade.at, locale)}</p>
          </div>
        </div>

        {/* 3 KPI banner */}
        <div className="grid grid-cols-3 divide-x divide-line/60 rounded-lg border border-line/60 bg-paper/40 py-2.5">
          <div className="px-2.5 text-center sm:px-3.5 sm:text-left">
            <p className="text-xs font-medium text-muted">{t.exports}</p>
            <p className="mt-1 flex items-baseline justify-center sm:justify-start gap-1 text-base font-bold tabular-nums text-ink sm:text-lg">
              {formatMw(trade.exportTotal, locale)}
              <span className="text-xs font-normal text-muted">{t.mw}</span>
            </p>
          </div>
          <div className="px-2.5 text-center sm:px-3.5 sm:text-left">
            <p className="text-xs font-medium text-muted">{t.imports}</p>
            <p className="mt-1 flex items-baseline justify-center sm:justify-start gap-1 text-base font-bold tabular-nums text-ink sm:text-lg">
              {formatMw(trade.importTotal, locale)}
              <span className="text-xs font-normal text-muted">{t.mw}</span>
            </p>
          </div>
          <div className="px-2.5 text-center sm:px-3.5 sm:text-left">
            <p className="text-xs font-medium text-muted">{t.net}</p>
            <p
              className={`mt-1 flex items-baseline justify-center sm:justify-start gap-1 text-base font-bold tabular-nums sm:text-lg ${
                isNetExport
                  ? "text-emerald-600 dark:text-emerald-400"
                  : isNetImport
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-ink"
              }`}
            >
              {formatSignedMw(trade.net, locale)}
              <span className="text-xs font-normal text-muted">{t.mw}</span>
            </p>
          </div>
        </div>

        {/* Intertie markets */}
        <ul className="mt-4 divide-y divide-line/40">
          {trade.markets.map((market) => {
            const hasExport = market.exportMw > 0;
            const hasImport = market.importMw > 0;

            return (
              <li
                key={market.key}
                className="flex items-center justify-between gap-3 py-2 text-sm transition-colors hover:bg-paper/40 -mx-1.5 px-1.5 rounded-lg"
              >
                <span className="font-medium text-ink">{t.market[market.key]}</span>
                <span className="tabular-nums">
                  {hasExport ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      ↗ {t.exporting} {formatMw(market.exportMw, locale)} {t.mw}
                    </span>
                  ) : hasImport ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-600 dark:text-sky-400">
                      ↙ {t.importing} {formatMw(market.importMw, locale)} {t.mw}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">0 {t.mw}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {trade.importFuels.length > 0 ? (
        <div className="mt-4 border-t border-line/60 pt-3.5">
          <p className="mb-2 text-xs font-medium text-muted">
            {t.imports} ({formatMw(trade.importTotal, locale)} {t.mw})
          </p>
          <div className="mb-3 flex h-2 w-full overflow-hidden rounded-md bg-paper gap-0.5">
            {trade.importFuels.map((fuel) => (
              <span
                key={fuel.key}
                style={{
                  width: `${pct(fuel.mw, trade.importTotal)}%`,
                  background: IMPORT_COLOR[fuel.key],
                }}
              />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted sm:grid-cols-3">
            {trade.importFuels.map((fuel) => (
              <li key={fuel.key} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-medium truncate">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: IMPORT_COLOR[fuel.key] }}
                  />
                  <span className="truncate">{t.importFuel[fuel.key]}</span>
                </span>
                <span className="font-semibold tabular-nums text-ink">
                  {formatPct(pct(fuel.mw, trade.importTotal), locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
