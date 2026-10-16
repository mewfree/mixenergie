import { pct } from "../../shared/mix.ts";
import type { MixPayload, ProvinceId } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { getDict } from "../i18n.ts";
import { IMPORT_COLOR } from "../lib/colors.ts";
import { formatHqStamp, formatMw, formatPct } from "../lib/format.ts";
import { SectionHeader, SegmentBar, Swatch } from "./share-bars.tsx";

type Props = {
  province: ProvinceId;
  locale: Locale;
  data: MixPayload;
};

const TONES = {
  export: { text: "text-positive", arrow: "↗ ", label: "netExporter" },
  import: { text: "text-accent", arrow: "↙ ", label: "netImporter" },
  balanced: { text: "text-muted", arrow: "", label: "balanced" },
} as const;

export function TradeCard({ province, locale, data }: Props) {
  const t = getDict(province, locale);
  const trade = data.trade;
  if (!trade) return null;

  const tone = trade.net > 0 ? TONES.export : trade.net < 0 ? TONES.import : TONES.balanced;

  return (
    <section className="border-t border-ink pt-4">
      <SectionHeader
        title={t.trade}
        meta={`${t.lastUpdate} ${formatHqStamp(trade.at, locale)}`}
        aside={
          <p className={`text-sm font-medium ${tone.text}`}>
            {tone.arrow}
            {t[tone.label]}
          </p>
        }
      />

      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-2">
        <div>
          <ul className="divide-y divide-line border-b border-line">
            {trade.markets.map((market) => (
              <li
                key={market.key}
                className="flex items-center justify-between gap-3 py-2.5 text-[15px]"
              >
                <span className="font-medium text-ink">{t.market[market.key]}</span>
                <span className="text-sm tabular-nums">
                  {market.exportMw > 0 ? (
                    <span className="font-medium text-positive">
                      ↗ {t.exporting} {formatMw(market.exportMw, locale)} {t.mw}
                    </span>
                  ) : market.importMw > 0 ? (
                    <span className="font-medium text-accent">
                      ↙ {t.importing} {formatMw(market.importMw, locale)} {t.mw}
                    </span>
                  ) : (
                    <span className="text-muted">0 {t.mw}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 text-sm tabular-nums">
            <div className="flex justify-between">
              <dt className="text-muted">{t.totalExported}</dt>
              <dd className="font-semibold text-ink">
                {formatMw(trade.exportTotal, locale)} {t.mw}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t.totalImported}</dt>
              <dd className="font-semibold text-ink">
                {formatMw(trade.importTotal, locale)} {t.mw}
              </dd>
            </div>
          </dl>
        </div>

        {trade.importFuels.length > 0 ? (
          <div>
            <p className="kicker mb-3">{t.importOrigin}</p>
            <SegmentBar
              className="mb-4 h-3"
              segments={trade.importFuels.map((fuel) => ({
                key: fuel.key,
                share: pct(fuel.mw, trade.importTotal),
                color: IMPORT_COLOR[fuel.key],
                title: `${t.importFuel[fuel.key]} : ${formatMw(fuel.mw, locale)} ${t.mw}`,
              }))}
            />
            <ul className="divide-y divide-line">
              {trade.importFuels.map((fuel) => (
                <li key={fuel.key} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-2.5 text-ink">
                    <Swatch color={IMPORT_COLOR[fuel.key]} />
                    {t.importFuel[fuel.key]}
                  </span>
                  <span className="tabular-nums">
                    <span className="font-semibold text-ink">
                      {formatPct(pct(fuel.mw, trade.importTotal), locale)}
                    </span>
                    <span className="ml-3 inline-block w-20 text-right text-muted">
                      {formatMw(fuel.mw, locale)} {t.mw}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
