import { pct } from "../../shared/mix.ts";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { IMPORT_COLOR } from "../lib/colors.ts";
import { formatHqStamp, formatMw, formatPct, formatSignedMw } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

export function TradeCard({ locale, data }: Props) {
  const t = dict[locale];
  const trade = data.trade;
  if (!trade) return null;

  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{t.trade}</h2>
        <p className="text-sm text-muted">{formatHqStamp(trade.at, locale)}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Mini label={t.exports} value={`${formatMw(trade.exportTotal, locale)} ${t.mw}`} />
        <Mini label={t.imports} value={`${formatMw(trade.importTotal, locale)} ${t.mw}`} />
        <Mini label={t.net} value={`${formatSignedMw(trade.net, locale)} ${t.mw}`} />
      </div>
      <ul className="mt-5 divide-y divide-line">
        {trade.markets.map((market) => (
          <li
            key={market.key}
            className="flex items-center justify-between gap-3 py-2.5 text-sm"
          >
            <span className="text-ink">{t.market[market.key]}</span>
            <span className="tabular-nums text-muted">
              {market.exportMw > 0
                ? `${t.exports} ${formatMw(market.exportMw, locale)}`
                : market.importMw > 0
                  ? `${t.imports} ${formatMw(market.importMw, locale)}`
                  : "0"}
            </span>
          </li>
        ))}
      </ul>
      {trade.importFuels.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            {t.imports}
          </p>
          <div className="mb-3 flex h-2 overflow-hidden rounded-full">
            {trade.importFuels.map((fuel) => (
              <span
                key={fuel.key}
                style={{
                  width: `${pct(fuel.mw, trade.importTotal)}%`,
                  background: IMPORT_COLOR[fuel.key],
                }}
              />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted sm:grid-cols-3">
            {trade.importFuels.map((fuel) => (
              <li key={fuel.key} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-ink/15"
                    style={{ background: IMPORT_COLOR[fuel.key] }}
                  />
                  {t.importFuel[fuel.key]}
                </span>
                <span className="tabular-nums">
                  {formatPct(pct(fuel.mw, trade.importTotal), locale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-paper px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold tabular-nums text-ink sm:text-lg">{value}</p>
    </div>
  );
}
