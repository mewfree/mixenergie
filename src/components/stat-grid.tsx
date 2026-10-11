import type { ReactNode } from "react";
import { pct } from "../../shared/mix.ts";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { formatG, formatHqStamp, formatMw, formatPct } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

function StatCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <article className="rounded-xl border border-line/70 bg-card p-4 transition-colors hover:border-line sm:p-5">
      <p className="text-xs font-medium text-muted sm:text-sm">{label}</p>
      {children}
    </article>
  );
}

const VALUE = "mt-2 flex items-baseline gap-1.5 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl";

export function StatGrid({ locale, data }: Props) {
  const t = dict[locale];
  const demand = data.demand;
  const prod = data.production;

  const demandRangePct =
    demand && demand.high > demand.low
      ? Math.min(100, Math.max(0, pct(demand.mw - demand.low, demand.high - demand.low)))
      : null;

  return (
    <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      <StatCard label={t.production}>
        <p className={`${VALUE} text-ink`}>
          {formatMw(prod.total, locale)}
          <span className="text-xs font-normal text-muted sm:text-sm">{t.mw}</span>
        </p>
        <p className="mt-2 text-xs text-muted truncate" title={formatHqStamp(prod.at, locale)}>
          {formatHqStamp(prod.at, locale)}
        </p>
      </StatCard>

      <StatCard label={t.demand}>
        <p className={`${VALUE} text-ink`}>
          {demand ? formatMw(demand.mw, locale) : "—"}
          {demand ? <span className="text-xs font-normal text-muted sm:text-sm">{t.mw}</span> : null}
        </p>
        {demand && demandRangePct != null ? (
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] tabular-nums text-muted">
              <span>{t.low} {formatMw(demand.low, locale)}</span>
              <span>{t.high} {formatMw(demand.high, locale)}</span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-paper">
              <div
                className="h-full rounded-full bg-muted/80 transition-all duration-300"
                style={{ width: `${demandRangePct}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">{t.easternTime}</p>
        )}
      </StatCard>

      <StatCard label={t.renewable}>
        <p className={`${VALUE} text-emerald-600 dark:text-emerald-400`}>
          {formatPct(prod.renewablePct, locale)}
        </p>
        <div className="mt-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.min(prod.renewablePct, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted truncate">
            {formatMw(prod.renewableMw, locale)} {t.mw}
          </p>
        </div>
      </StatCard>

      <StatCard label={t.intensity}>
        <p className={`${VALUE} text-ink`}>
          {formatG(prod.intensity, locale)}
          <span className="text-xs font-normal text-muted sm:text-sm">{t.intensityUnit}</span>
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
          <p className="text-xs text-muted truncate">{t.ultraLowCarbon}</p>
        </div>
      </StatCard>
    </section>
  );
}
