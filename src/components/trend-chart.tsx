import { useMemo, useRef, useState } from "react";
import type { MixPayload } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { dict } from "../i18n.ts";
import { invertCtmX, linePath, nearestIndex, nearestValue, niceScale, sampleTicks, stamp } from "../lib/chart.ts";
import { formatHqTick, formatMw, formatMwCompact } from "../lib/format.ts";

type Props = {
  locale: Locale;
  data: MixPayload;
};

const W = 640;
const H = 196;
const PAD = { t: 12, r: 14, b: 28, l: 38 };

export function TrendChart({ locale, data }: Props) {
  const t = dict[locale];
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const chart = useMemo(
    () => layout(data.series.production, data.series.demand),
    [data.series.production, data.series.demand],
  );

  if (!chart) return null;

  const activeIndex =
    hover == null ? chart.points.length - 1 : Math.min(hover, chart.points.length - 1);
  const active = chart.points[activeIndex];
  if (!active) return null;

  function scrub(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg || !chart) return;
    const ctm = svg.getScreenCTM();
    const mapped = ctm ? invertCtmX(clientX, clientY, ctm) : null;
    if (mapped == null) {
      const rect = svg.getBoundingClientRect();
      setHover(nearestIndex(chart.xs, ((clientX - rect.left) / Math.max(rect.width, 1)) * W));
      return;
    }
    setHover(nearestIndex(chart.xs, mapped));
  }

  return (
    <section className="rounded-2xl border border-line bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-ink">{t.lastHours}</h2>
          <p className="mt-0.5 text-xs tabular-nums text-muted">{formatHqTick(active.t, locale)}</p>
        </div>
        <p className="text-sm tabular-nums text-muted" aria-live="polite">
          {active.prod != null
            ? `${t.production} ${formatMw(active.prod, locale)} ${t.mw}`
            : ""}
          {active.prod != null && active.demand != null ? " · " : ""}
          {active.demand != null
            ? `${t.demand} ${formatMw(active.demand, locale)} ${t.mw}`
            : ""}
        </p>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-44 w-full touch-none cursor-crosshair select-none focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:h-48"
        role="img"
        tabIndex={0}
        aria-label={t.lastHours}
        aria-valuetext={`${formatHqTick(active.t, locale)} ${
          active.prod != null ? `${t.production} ${formatMw(active.prod, locale)} ${t.mw}` : ""
        } ${active.demand != null ? `${t.demand} ${formatMw(active.demand, locale)} ${t.mw}` : ""}`.trim()}
        onPointerDown={(event) => {
          svgRef.current?.setPointerCapture(event.pointerId);
          scrub(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse" && event.buttons === 0) return;
          scrub(event.clientX, event.clientY);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setHover(null);
        }}
        onKeyDown={(event) => {
          const last = chart.points.length - 1;
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            setHover(Math.max(0, activeIndex - 1));
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            setHover(Math.min(last, activeIndex + 1));
          } else if (event.key === "Escape") {
            setHover(null);
          }
        }}
      >
        {chart.yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={chart.yAt(tick)}
              y2={chart.yAt(tick)}
              className="stroke-line"
              strokeWidth="1"
            />
            <text
              x={PAD.l - 6}
              y={chart.yAt(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted text-[10px]"
            >
              {formatMwCompact(tick, locale)}
            </text>
          </g>
        ))}
        {chart.xTicks.map((tick, i) => (
          <text
            key={`${tick.t}-${i}`}
            x={tick.x}
            y={H - 8}
            textAnchor={i === 0 ? "start" : i === chart.xTicks.length - 1 ? "end" : "middle"}
            className="fill-muted text-[10px]"
          >
            {formatHqTick(tick.t, locale)}
          </text>
        ))}
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
        <line
          x1={active.x}
          x2={active.x}
          y1={PAD.t}
          y2={H - PAD.b}
          className="stroke-ink/40"
          strokeWidth="1"
        />
        {active.prod != null ? (
          <circle cx={active.x} cy={chart.yAt(active.prod)} r="3.5" className="fill-accent" />
        ) : null}
        {active.demand != null ? (
          <circle cx={active.x} cy={chart.yAt(active.demand)} r="3.5" className="fill-ink" />
        ) : null}
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
  const yScale = niceScale(Math.max(1, ...ys));
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const xAt = (x: number) => PAD.l + ((x - x0) / Math.max(x1 - x0, 1)) * innerW;
  const yAt = (y: number) => PAD.t + innerH - (y / yScale.max) * innerH;

  const prodLine = linePath(prodPts, xAt, yAt);
  const last = prodPts[prodPts.length - 1];
  const prodArea = last
    ? `${prodLine} L${xAt(last.x)} ${PAD.t + innerH} L${xAt(prodPts[0]?.x ?? last.x)} ${PAD.t + innerH} Z`
    : "";

  const times = new Map<number, string>();
  for (const point of [...prodPts, ...demandPts]) {
    if (!times.has(point.x)) times.set(point.x, point.t);
  }
  const minute = 60 * 1000;
  const points = [...times.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([x, t]) => ({
      t,
      x: xAt(x),
      prod: nearestValue(prodPts, x, 45 * minute),
      demand: nearestValue(demandPts, x, 20 * minute),
    }));

  return {
    prodLine,
    prodArea,
    demandLine: demandPts.length ? linePath(demandPts, xAt, yAt) : null,
    yAt,
    yTicks: yScale.ticks,
    xTicks: sampleTicks(points, 5).map((p) => ({ t: p.t, x: p.x })),
    points,
    xs: points.map((p) => p.x),
  };
}
