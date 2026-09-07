import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { formatG, formatHqStamp, formatMw, formatPct } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

export function StatGrid({ locale, data }: Props) {
  const t = dict[locale];
  const demand = data.demand;
  const prod = data.production;

  const demandRangePct =
    demand && demand.high > demand.low
      ? Math.min(
          100,
          Math.max(0, ((demand.mw - demand.low) / (demand.high - demand.low)) * 100),
        )
      : null;

  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      {/* Production */}
      <article className="group rounded-2xl border border-line/80 bg-card p-4.5 shadow-xs transition-all duration-200 hover:border-line hover:shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted sm:text-sm">
            {t.production}
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </span>
        </div>
        <p className="mt-2.5 flex items-baseline gap-1.5 text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
          {formatMw(prod.total, locale)}
          <span className="text-sm font-semibold text-muted sm:text-base">{t.mw}</span>
        </p>
        <p className="mt-2 text-xs font-medium text-muted sm:text-sm truncate" title={formatHqStamp(prod.at, locale)}>
          {formatHqStamp(prod.at, locale)}
        </p>
      </article>

      {/* Demand */}
      <article className="group rounded-2xl border border-line/80 bg-card p-4.5 shadow-xs transition-all duration-200 hover:border-line hover:shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted sm:text-sm">
            {t.demand}
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-muted">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </span>
        </div>
        <p className="mt-2.5 flex items-baseline gap-1.5 text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
          {demand ? formatMw(demand.mw, locale) : "—"}
          {demand ? <span className="text-sm font-semibold text-muted sm:text-base">{t.mw}</span> : null}
        </p>
        {demand && demandRangePct != null ? (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs tabular-nums text-muted">
              <span>{t.low} {formatMw(demand.low, locale)}</span>
              <span>{t.high} {formatMw(demand.high, locale)}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-paper">
              <div
                className="h-full rounded-full bg-ink/70 transition-all duration-300"
                style={{ width: `${demandRangePct}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs font-medium text-muted sm:text-sm">{t.easternTime}</p>
        )}
      </article>

      {/* Renewable */}
      <article className="group rounded-2xl border border-line/80 bg-card p-4.5 shadow-xs transition-all duration-200 hover:border-line hover:shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted sm:text-sm">
            {t.renewable}
          </p>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12A10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 3.65 2.45 6.74 5.82 7.68-.08-.43-.12-.87-.12-1.33 0-3.8 2.66-7.05 6.3-7.91V8.5A6.5 6.5 0 0 0 9.5 2.08C10.3 2.03 11.14 2 12 2Z" />
            </svg>
          </span>
        </div>
        <p className="mt-2.5 flex items-baseline gap-1 text-3xl font-extrabold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-4xl">
          {formatPct(prod.renewablePct, locale)}
        </p>
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${Math.min(prod.renewablePct, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs font-medium text-muted sm:text-sm truncate">
            {formatMw(prod.renewableMw, locale)} {t.mw}
          </p>
        </div>
      </article>

      {/* GHG Intensity */}
      <article className="group rounded-2xl border border-line/80 bg-card p-4.5 shadow-xs transition-all duration-200 hover:border-line hover:shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted sm:text-sm">
            {t.intensity}
          </p>
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            A+
          </span>
        </div>
        <p className="mt-2.5 flex items-baseline gap-1.5 text-3xl font-extrabold tabular-nums tracking-tight text-ink sm:text-4xl">
          {formatG(prod.intensity, locale)}
          <span className="text-sm font-semibold text-muted sm:text-base">{t.intensityUnit}</span>
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:text-sm truncate">
            {t.ultraLowCarbon}
          </p>
        </div>
      </article>
    </section>
  );
}
