import { pct } from "../../shared/mix.ts";
import { SOURCE_KEYS, type MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { SOURCE_COLOR } from "../lib/colors.ts";
import { formatMw, formatPct } from "../lib/format.ts";
import { SectionHeader, SegmentBar, Swatch } from "./share-bars.tsx";

type Props = {
  locale: Locale;
  data: MixPayload;
};

/** Current generation mix, with the 2025 annual mix alongside for context. */
export function MixList({ locale, data }: Props) {
  const t = dict[locale];
  const { sources, total } = data.production;
  const year = data.year;
  const columns = year ? "grid-cols-[1fr_6.5rem_4.5rem]" : "grid-cols-[1fr_6.5rem]";

  return (
    <section className="border-t border-ink pt-4">
      <SectionHeader
        title={t.sources}
        aside={
          <p className="text-sm tabular-nums text-muted">
            {t.total}{" "}
            <span className="numeral text-base text-ink">{formatMw(total, locale)}</span> {t.mw}
          </p>
        }
      />

      <SegmentBar
        className="mb-5 h-3"
        segments={SOURCE_KEYS.map((key) => {
          const share = pct(sources[key], total);
          return {
            key,
            share,
            color: SOURCE_COLOR[key],
            title: `${t.source[key]} : ${formatPct(share, locale)} (${formatMw(sources[key], locale)} MW)`,
          };
        })}
      />

      <div className={`grid items-end gap-x-4 border-b border-line pb-2 ${columns}`}>
        <span />
        <span className="kicker text-right">{t.nowCol}</span>
        {year ? <span className="kicker text-right">{t.yearCol}</span> : null}
      </div>

      <ul className="divide-y divide-line">
        {SOURCE_KEYS.map((key) => {
          const mw = sources[key];
          return (
            <li key={key} className={`grid items-center gap-x-4 py-3 ${columns}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 text-[15px] font-medium text-ink">
                  <Swatch color={SOURCE_COLOR[key]} />
                  {t.source[key]}
                </div>
                <p className="mt-0.5 hidden pl-5 text-xs leading-snug text-muted sm:block">{t.sourceHint[key]}</p>
              </div>
              <div className="text-right tabular-nums">
                <p className="text-[15px] font-semibold text-ink">
                  {formatPct(pct(mw, total), locale)}
                </p>
                <p className="text-xs text-muted">
                  {formatMw(mw, locale)} {t.mw}
                </p>
              </div>
              {year ? (
                <p className="text-right text-[15px] tabular-nums text-muted">
                  {formatPct(pct(year.sources[key], year.totalMwh), locale)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      {year ? <p className="mt-3 text-xs text-muted">{t.yearHint}</p> : null}
    </section>
  );
}
