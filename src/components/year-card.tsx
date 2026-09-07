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
    <section className="flex flex-col justify-between rounded-xl border border-line/70 bg-card p-5 sm:p-6 transition-colors">
      <div>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{t.yearTitle}</h2>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {formatPct(year.renewablePct, locale)} {t.renewable.toLowerCase()}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{t.yearHint}</p>
          </div>
        </div>

        {/* Proportional bar */}
        <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-md bg-paper gap-0.5">
          {SOURCE_KEYS.map((key) => {
            const share = pct(year.sources[key], year.totalMwh);
            if (share <= 0) return null;
            return (
              <span
                key={key}
                style={{ width: `${share}%`, background: SOURCE_COLOR[key] }}
                className="h-full transition-all duration-300 first:rounded-l-sm last:rounded-r-sm"
                title={`${t.source[key]} : ${formatPct(share, locale)}`}
              />
            );
          })}
        </div>

        {/* Sources list */}
        <ul className="divide-y divide-line/40">
          {SOURCE_KEYS.map((key) => {
            const share = pct(year.sources[key], year.totalMwh);
            return (
              <li
                key={key}
                className="flex items-center justify-between gap-3 py-2 text-sm transition-colors hover:bg-paper/40 -mx-1.5 px-1.5 rounded-lg"
              >
                <div className="flex items-center gap-2 font-medium text-ink">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: SOURCE_COLOR[key] }}
                  />
                  <span>{t.source[key]}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                  <div className="hidden sm:block h-1.5 w-20 overflow-hidden rounded-full bg-paper">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(share, share > 0 ? 1 : 0)}%`,
                        background: SOURCE_COLOR[key],
                      }}
                    />
                  </div>
                  <span className="font-semibold tabular-nums text-ink">
                    {formatPct(share, locale)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
