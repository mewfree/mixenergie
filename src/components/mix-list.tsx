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
    <section className="rounded-2xl border border-line/80 bg-card p-4.5 shadow-xs transition-all sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">{t.sources}</h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">{formatHqStamp(data.production.at, locale)}</p>
        </div>
        <span className="rounded-full border border-line bg-paper/60 px-3 py-1 text-xs font-semibold tabular-nums text-muted sm:text-sm">
          Total : <strong className="font-bold text-ink">{formatMw(total, locale)} {t.mw}</strong>
        </span>
      </div>

      {/* Segmented proportional bar */}
      <div className="mb-5 flex h-4 w-full overflow-hidden rounded-full bg-paper p-0.5 shadow-inner">
        {SOURCE_KEYS.map((key) => {
          const share = pct(sources[key], total);
          if (share <= 0) return null;
          return (
            <span
              key={key}
              style={{ width: `${share}%`, background: SOURCE_COLOR[key] }}
              className="first:rounded-l-full last:rounded-r-full transition-all duration-300"
              title={`${t.source[key]} : ${formatPct(share, locale)} (${formatMw(sources[key], locale)} MW)`}
            />
          );
        })}
      </div>

      {/* Sources list */}
      <ul className="space-y-1">
        {SOURCE_KEYS.map((key) => {
          const mw = sources[key];
          const share = pct(mw, total);
          return (
            <li
              key={key}
              className="group -mx-2.5 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-paper/50 sm:-mx-3 sm:px-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-ink">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full shadow-xs"
                      style={{ background: SOURCE_COLOR[key] }}
                    />
                    <span className="truncate">{t.source[key]}</span>
                  </div>
                  <p className="mt-0.5 pl-5.5 text-xs text-muted truncate">
                    {t.sourceHint[key]}
                  </p>
                </div>
                <div className="shrink-0 text-right tabular-nums">
                  <span className="text-base font-bold text-ink sm:text-lg">
                    {formatPct(share, locale)}
                  </span>
                  <span className="ml-2 text-xs font-medium text-muted sm:ml-3 sm:text-sm">
                    {formatMw(mw, locale)} {t.mw}
                  </span>
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(share, mw > 0 ? 0.75 : 0)}%`,
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
