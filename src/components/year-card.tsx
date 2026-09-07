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
    <section className="flex flex-col justify-between rounded-2xl border border-line/80 bg-card p-4.5 shadow-xs transition-all sm:p-6">
      <div>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-ink">{t.yearTitle}</h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {formatPct(year.renewablePct, locale)} {t.renewable.toLowerCase()}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">{t.yearHint}</p>
          </div>
        </div>

        {/* Proportional bar */}
        <div className="mb-5 flex h-4 w-full overflow-hidden rounded-full bg-paper p-0.5 shadow-inner">
          {SOURCE_KEYS.map((key) => {
            const share = pct(year.sources[key], year.totalMwh);
            if (share <= 0) return null;
            return (
              <span
                key={key}
                style={{ width: `${share}%`, background: SOURCE_COLOR[key] }}
                className="first:rounded-l-full last:rounded-r-full transition-all duration-300"
                title={`${t.source[key]} : ${formatPct(share, locale)}`}
              />
            );
          })}
        </div>

        {/* Sources list */}
        <ul className="space-y-1">
          {SOURCE_KEYS.map((key) => {
            const share = pct(year.sources[key], year.totalMwh);
            return (
              <li
                key={key}
                className="group -mx-2.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-paper/50 sm:-mx-3 sm:px-3"
              >
                <div className="flex items-center justify-between gap-3 text-sm sm:text-base">
                  <div className="flex items-center gap-2.5 font-semibold text-ink">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-xs"
                      style={{ background: SOURCE_COLOR[key] }}
                    />
                    <span>{t.source[key]}</span>
                  </div>
                  <span className="text-base font-bold tabular-nums text-ink sm:text-lg">
                    {formatPct(share, locale)}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(share, share > 0 ? 0.75 : 0)}%`,
                      background: SOURCE_COLOR[key],
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
