import { SOURCE_KEYS } from "../../shared/types.ts";
import { pct } from "../../shared/mix.ts";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { SOURCE_COLOR } from "../lib/colors.ts";
import { formatHqStamp, formatMw, formatPct } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

export function MixList({ locale, data }: Props) {
  const t = dict[locale];
  const { sources, total } = data.production;

  return (
    <section className="rounded-xl border border-line/70 bg-card p-5 sm:p-6 transition-colors">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{t.sources}</h2>
          <p className="mt-0.5 text-xs text-muted">{formatHqStamp(data.production.at, locale)}</p>
        </div>
        <span className="rounded-md border border-line/70 bg-paper/60 px-2.5 py-1 text-xs tabular-nums text-muted sm:text-sm font-medium">
          Total : <strong className="font-semibold text-ink">{formatMw(total, locale)} {t.mw}</strong>
        </span>
      </div>

      {/* Segmented proportional bar */}
      <div className="mb-5 flex h-2.5 w-full overflow-hidden rounded-md bg-paper gap-0.5">
        {SOURCE_KEYS.map((key) => {
          const share = pct(sources[key], total);
          if (share <= 0) return null;
          return (
            <span
              key={key}
              style={{ width: `${share}%`, background: SOURCE_COLOR[key] }}
              className="h-full transition-all duration-300 first:rounded-l-sm last:rounded-r-sm"
              title={`${t.source[key]} : ${formatPct(share, locale)} (${formatMw(sources[key], locale)} MW)`}
            />
          );
        })}
      </div>

      {/* Sources list */}
      <ul className="divide-y divide-line/40">
        {SOURCE_KEYS.map((key) => {
          const mw = sources[key];
          const share = pct(mw, total);
          return (
            <li
              key={key}
              className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-paper/40 -mx-2 px-2 rounded-lg"
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-ink">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: SOURCE_COLOR[key] }}
                  />
                  <span className="truncate">{t.source[key]}</span>
                </div>
                <p className="mt-0.5 pl-4.5 text-xs text-muted truncate">
                  {t.sourceHint[key]}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                {/* Inline mini proportion bar */}
                <div className="hidden sm:block h-1.5 w-20 overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(share, mw > 0 ? 1 : 0)}%`,
                      background: SOURCE_COLOR[key],
                    }}
                  />
                </div>
                <div className="text-right tabular-nums">
                  <span className="text-sm font-bold text-ink sm:text-base">
                    {formatPct(share, locale)}
                  </span>
                  <span className="ml-2 inline-block text-xs text-muted sm:ml-3 sm:text-sm">
                    {formatMw(mw, locale)} {t.mw}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
