import { SOURCE_KEYS } from "../../shared/types.ts";
import { pct } from "../../shared/mix.ts";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { SOURCE_COLOR } from "../lib/colors.ts";
import { formatPct } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

export function YearCard({ locale, data }: Props) {
  const t = dict[locale];
  const year = data.year;
  if (!year) return null;

  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <h2 className="text-lg font-semibold text-ink">{t.yearTitle}</h2>
      <p className="mt-1 text-sm text-muted">{t.yearHint}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-ink">
        {formatPct(year.renewablePct, locale)} {t.renewable.toLowerCase()}
      </p>
      <ul className="mt-5 space-y-3">
        {SOURCE_KEYS.map((key) => {
          const share = pct(year.sources[key], year.totalMwh);
          return (
            <li key={key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: SOURCE_COLOR[key] }}
                  />
                  {t.source[key]}
                </span>
                <span className="tabular-nums text-muted">{formatPct(share, locale)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(share, share > 0 ? 0.6 : 0)}%`,
                    background: SOURCE_COLOR[key],
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
