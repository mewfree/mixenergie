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

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat
        label={t.production}
        value={`${formatMw(data.production.total, locale)} ${t.mw}`}
        hint={formatHqStamp(data.production.at, locale)}
      />
      <Stat
        label={t.demand}
        value={demand ? `${formatMw(demand.mw, locale)} ${t.mw}` : "—"}
        hint={
          demand
            ? `${formatHqStamp(demand.at, locale)} · ${t.low} ${formatMw(demand.low, locale)} · ${t.high} ${formatMw(demand.high, locale)}`
            : t.easternTime
        }
      />
      <Stat
        label={t.renewable}
        value={formatPct(data.production.renewablePct, locale)}
        hint={`${formatMw(data.production.renewableMw, locale)} ${t.mw}`}
      />
      <Stat
        label={t.intensity}
        value={`${formatG(data.production.intensity, locale)} ${t.intensityUnit}`}
        hint={t.updated}
      />
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-card px-4 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-ink sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </article>
  );
}
