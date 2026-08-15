import { useMemo } from "react";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { formatHqHour, formatMw } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

const W = 640;
const H = 180;
const PAD = { t: 12, r: 10, b: 26, l: 10 };

export function TrendChart({ locale, data }: Props) {
  const t = dict[locale];
  const chart = useMemo(
    () => layout(data.series.production, data.series.demand),
    [data.series.production, data.series.demand],
  );

  if (!chart) return null;

  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">{t.lastHours}</h2>
        <p className="text-sm tabular-nums text-muted">
          {t.production} {formatMw(chart.lastProd, locale)} {t.mw}
          {chart.lastDemand != null
            ? ` · ${t.demand} ${formatMw(chart.lastDemand, locale)} ${t.mw}`
            : ""}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-40 w-full sm:h-44" role="img" aria-label={t.lastHours}>
        <path d={chart.prodArea} className="fill-accent/15" />
        <path
          d={chart.prodLine}
          fill="none"
          className="stroke-accent"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {chart.demandLine ? (
          <path
            d={chart.demandLine}
            fill="none"
            className="stroke-ink"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {chart.labels.map((label, i) => (
          <text
            key={`${label.t}-${i}`}
            x={label.x}
            y={H - 8}
            textAnchor={i === 0 ? "start" : i === chart.labels.length - 1 ? "end" : "middle"}
            className="fill-muted text-[10px]"
          >
            {formatHqHour(label.t, locale)}
          </text>
        ))}
      </svg>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-accent" />
          {t.production}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-px w-3 border-t border-dashed border-ink" />
          {t.demand}
        </span>
      </div>
    </section>
  );
}

function layout(
  production: MixPayload["series"]["production"],
  demand: MixPayload["series"]["demand"],
) {
  if (production.length === 0) return null;

  const prodPts = production.map((p) => ({ t: p.t, y: p.total, x: stamp(p.t) }));
  const demandPts = demand.map((d) => ({ t: d.t, y: d.mw, x: stamp(d.t) }));
  const xs = [...prodPts.map((p) => p.x), ...demandPts.map((p) => p.x)];
  const ys = [...prodPts.map((p) => p.y), ...demandPts.map((p) => p.y)];
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y1 = Math.max(1, ...ys);
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const xAt = (x: number) => PAD.l + ((x - x0) / Math.max(x1 - x0, 1)) * innerW;
  const yAt = (y: number) => PAD.t + innerH - (y / y1) * innerH;

  const prodLine = linePath(prodPts, xAt, yAt);
  const last = prodPts[prodPts.length - 1];
  const prodArea = last
    ? `${prodLine} L${xAt(last.x)} ${PAD.t + innerH} L${xAt(prodPts[0]?.x ?? last.x)} ${PAD.t + innerH} Z`
    : "";

  const labels = [prodPts[0], prodPts[Math.floor(prodPts.length / 2)], last].filter(
    (p): p is (typeof prodPts)[number] => Boolean(p),
  );

  return {
    prodLine,
    prodArea,
    demandLine: demandPts.length ? linePath(demandPts, xAt, yAt) : null,
    labels: labels.map((p) => ({ t: p.t, x: xAt(p.x) })),
    lastProd: last?.y ?? 0,
    lastDemand: demandPts[demandPts.length - 1]?.y ?? null,
  };
}

function linePath(
  points: { x: number; y: number }[],
  xAt: (x: number) => number,
  yAt: (y: number) => number,
): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(p.x).toFixed(1)} ${yAt(p.y).toFixed(1)}`)
    .join(" ");
}

function stamp(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return 0;
  const [, year, month, day, hour, minute] = match;
  return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}
