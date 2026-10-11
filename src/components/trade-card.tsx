import { pct } from "../../shared/mix.ts";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { IMPORT_COLOR } from "../lib/colors.ts";
import { formatHqStamp, formatMw, formatPct, formatSignedMw } from "../lib/format.ts";
import { SegmentBar } from "./share-bars.tsx";

type Props = {
  locale: Locale;
  data: MixPayload;
};

const TONES = {
  export: {
    badge: "border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    arrow: "↗ ",
    label: "netExporter",
  },
  import: {
    badge: "border border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    text: "text-sky-600 dark:text-sky-400",
    arrow: "↙ ",
    label: "netImporter",
  },
  balanced: {
    badge: "border border-line bg-paper text-muted",
    text: "text-ink",
    arrow: "",
    label: "balanced",
  },
} as const;

type KpiProps = { label: string; value: string; unit: string; className?: string };

function Kpi({ label, value, unit, className = "text-ink" }: KpiProps) {
  return (
    <div className="px-2.5 text-center sm:px-3.5 sm:text-left">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={`mt-1 flex items-baseline justify-center gap-1 text-base font-bold tabular-nums sm:justify-start sm:text-lg ${className}`}
      >
        {value}
        <span className="text-xs font-normal text-muted">{unit}</span>
      </p>
    </div>
  );
}

export function TradeCard({ locale, data }: Props) {
  const t = dict[locale];
  const trade = data.trade;
  if (!trade) return null;

  const tone = trade.net > 0 ? TONES.export : trade.net < 0 ? TONES.import : TONES.balanced;

  return (
    <section className="flex flex-col justify-between rounded-xl border border-line/70 bg-card p-5 sm:p-6 transition-colors">
      <div>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{t.trade}</h2>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${tone.badge}`}
              >
                {tone.arrow}
                {t[tone.label]}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{formatHqStamp(trade.at, locale)}</p>
          </div>
        </div>

        {/* 3 KPI banner */}
        <div className="grid grid-cols-3 divide-x divide-line/60 rounded-lg border border-line/60 bg-paper/40 py-2.5">
          <Kpi label={t.exports} value={formatMw(trade.exportTotal, locale)} unit={t.mw} />
          <Kpi label={t.imports} value={formatMw(trade.importTotal, locale)} unit={t.mw} />
          <Kpi
            label={t.net}
            value={formatSignedMw(trade.net, locale)}
            unit={t.mw}
            className={tone.text}
          />
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
          <SegmentBar
            className="mb-3 h-2"
            segments={trade.importFuels.map((fuel) => ({
              key: fuel.key,
              share: pct(fuel.mw, trade.importTotal),
              color: IMPORT_COLOR[fuel.key],
            }))}
          />
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
