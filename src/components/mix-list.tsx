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
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{t.sources}</h2>
        <p className="text-sm text-muted">{formatHqStamp(data.production.at, locale)}</p>
      </div>
      <div className="mb-5 flex h-3 overflow-hidden rounded-full">
        {SOURCE_KEYS.map((key) => {
          const share = pct(sources[key], total);
          if (share <= 0) return null;
          return (
            <span
              key={key}
              style={{ width: `${share}%`, background: SOURCE_COLOR[key] }}
              title={`${t.source[key]} ${formatPct(share, locale)}`}
            />
          );
        })}
      </div>
      <ul className="space-y-3">
        {SOURCE_KEYS.map((key) => {
          const mw = sources[key];
          const share = pct(mw, total);
          return (
            <li key={key}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span
                  className="flex items-center gap-2 font-medium text-ink"
                  title={t.sourceHint[key]}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: SOURCE_COLOR[key] }}
                  />
                  {t.source[key]}
                </span>
                <span className="tabular-nums text-muted">
                  <span className="mr-3 font-medium text-ink">{formatPct(share, locale)}</span>
                  {formatMw(mw, locale)} {t.mw}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(share, mw > 0 ? 0.6 : 0)}%`,
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
