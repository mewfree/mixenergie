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
    <section className="flex flex-col justify-between rounded-2xl border border-line/80 bg-card p-4.5 shadow-xs transition-all sm:p-6">
      <div>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-ink">{t.trade}</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  isNetExport
                    ? "border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : isNetImport
                      ? "border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border border-line bg-paper text-muted"
                }`}
              >
                {isNetExport ? "↗ " + t.netExporter : isNetImport ? "↙ " + t.netImporter : t.balanced}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">{formatHqStamp(trade.at, locale)}</p>
          </div>
        </div>

        {/* 3 KPI mini cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Mini label={t.exports} value={`${formatMw(trade.exportTotal, locale)}`} unit={t.mw} />
          <Mini label={t.imports} value={`${formatMw(trade.importTotal, locale)}`} unit={t.mw} />
          <Mini
            label={t.net}
            value={formatSignedMw(trade.net, locale)}
            unit={t.mw}
            highlight={isNetExport ? "positive" : isNetImport ? "negative" : "neutral"}
          />
        </div>

        {/* Intertie markets */}
        <ul className="mt-5 divide-y divide-line/60">
          {trade.markets.map((market) => {
            const hasExport = market.exportMw > 0;
            const hasImport = market.importMw > 0;

            return (
              <li
                key={market.key}
                className="flex items-center justify-between gap-3 py-2.5 text-sm sm:text-base transition-colors hover:bg-paper/40 -mx-1.5 px-1.5 rounded-lg"
              >
                <span className="font-semibold text-ink">{t.market[market.key]}</span>
                <span className="tabular-nums">
                  {hasExport ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      ↗ {t.exporting} {formatMw(market.exportMw, locale)} {t.mw}
                    </span>
                  ) : hasImport ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2.5 py-1 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ↙ {t.importing} {formatMw(market.importMw, locale)} {t.mw}
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm text-muted">0 {t.mw}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {trade.importFuels.length > 0 ? (
        <div className="mt-5 border-t border-line/60 pt-4">
          <p className="mb-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-muted">
            {t.imports} ({formatMw(trade.importTotal, locale)} {t.mw})
          </p>
          <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full bg-paper">
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
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm text-muted sm:grid-cols-3">
            {trade.importFuels.map((fuel) => (
              <li key={fuel.key} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-medium truncate">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: IMPORT_COLOR[fuel.key] }}
                  />
                  <span className="truncate">{t.importFuel[fuel.key]}</span>
                </span>
                <span className="font-bold tabular-nums text-ink">
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

function Mini({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: string;
  unit: string;
  highlight?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-line/60 bg-paper/70 px-3 py-2.5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1 flex items-baseline gap-1 text-lg font-extrabold tabular-nums sm:text-xl ${
          highlight === "positive"
            ? "text-emerald-600 dark:text-emerald-400"
            : highlight === "negative"
              ? "text-blue-600 dark:text-blue-400"
              : "text-ink"
        }`}
      >
        {value}
        <span className="text-xs font-normal text-muted sm:text-sm">{unit}</span>
      </p>
    </div>
  );
}
