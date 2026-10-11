import type { ReactNode } from "react";
import { LCA_G_PER_KWH, pct } from "../../shared/mix.ts";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { formatG, formatMw, formatSignedMw } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

function StatCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <article className="border-t border-ink pt-3">
      <p className="kicker">{label}</p>
      {children}
    </article>
  );
}

const VALUE = "numeral mt-3 flex items-baseline gap-1.5 text-3xl leading-none sm:text-4xl";
const UNIT = "text-xs font-normal tracking-normal text-muted";
const SUB = "mt-3 text-sm text-muted";

export function StatGrid({ locale, data }: Props) {
  const t = dict[locale];
  const { demand, production: prod, trade } = data;

  const demandRangePct =
    demand && demand.high > demand.low
      ? Math.min(100, Math.max(0, pct(demand.mw - demand.low, demand.high - demand.low)))
      : null;

  const netLabel = !trade
    ? null
    : trade.net > 0
      ? t.netExporter
      : trade.net < 0
        ? t.netImporter
        : t.balanced;

  return (
    <section className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
      <StatCard label={t.production}>
        <p className={VALUE}>
          {formatMw(prod.total, locale)}
          <span className={UNIT}>{t.mw}</span>
        </p>
        <p className={SUB}>
          {formatMw(prod.renewableMw, locale)} {t.mw} {t.renewableShort}
        </p>
      </StatCard>

      <StatCard label={t.demand}>
        <p className={VALUE}>
          {demand ? formatMw(demand.mw, locale) : "—"}
          {demand ? <span className={UNIT}>{t.mw}</span> : null}
        </p>
        {demand && demandRangePct != null ? (
          <div className="mt-3">
            <div className="relative h-px w-full bg-line">
              <span
                className="absolute -top-[3px] h-[7px] w-0.5 -translate-x-1/2 bg-ink"
                style={{ left: `${demandRangePct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs tabular-nums text-muted">
              <span>{formatMw(demand.low, locale)}</span>
              <span>{formatMw(demand.high, locale)}</span>
            </div>
          </div>
        ) : (
          <p className={SUB}>{t.easternTime}</p>
        )}
      </StatCard>

      <StatCard label={t.intensity}>
        <p className={VALUE}>
          {formatG(prod.intensity, locale)}
          <span className={UNIT}>{t.intensityUnit}</span>
        </p>
        <p className={SUB}>
          {t.intensityRef.replace("{g}", formatG(LCA_G_PER_KWH.thermal, locale))}
        </p>
      </StatCard>

      <StatCard label={t.net}>
        <p className={VALUE}>
          {trade ? formatSignedMw(trade.net, locale) : "—"}
          {trade ? <span className={UNIT}>{t.mw}</span> : null}
        </p>
        <p className={SUB}>{netLabel ?? t.easternTime}</p>
      </StatCard>
    </section>
  );
}
