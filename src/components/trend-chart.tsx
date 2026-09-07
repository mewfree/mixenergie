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
const H = 210;
const PAD = { t: 14, r: 16, b: 30, l: 40 };

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

  const delta =
    active.prod != null && active.demand != null ? active.prod - active.demand : null;

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
    <section className="rounded-2xl border border-line/80 bg-card p-4.5 shadow-xs transition-all sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-ink">{t.lastHours}</h2>
            {hover != null ? (
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">
                {locale === "fr" ? "Curseur actif" : "Active scrub"}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs font-medium tabular-nums text-muted sm:text-sm">
            {formatHqTick(active.t, locale)}
          </p>
        </div>

        {/* Interactive scrubber HUD */}
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm tabular-nums" aria-live="polite">
          {active.prod != null ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper/60 px-2.5 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="text-muted">{t.production} :</span>
              <strong className="font-bold text-ink">{formatMw(active.prod, locale)} {t.mw}</strong>
            </span>
          ) : null}
          {active.demand != null ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper/60 px-2.5 py-1">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-ink" />
              <span className="text-muted">{t.demand} :</span>
              <strong className="font-bold text-ink">{formatMw(active.demand, locale)} {t.mw}</strong>
            </span>
          ) : null}
          {delta != null ? (
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold ${
                delta >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {delta >= 0 ? "+" : ""}{formatMw(delta, locale)} {t.mw} ({delta >= 0 ? t.surplus : t.deficit})
            </span>
          ) : null}
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-48 w-full touch-none cursor-crosshair select-none focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:h-56"
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
        <defs>
          <linearGradient id="prodTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#009aff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#009aff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {chart.yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={chart.yAt(tick)}
              y2={chart.yAt(tick)}
              className="stroke-line/60"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={PAD.l - 8}
              y={chart.yAt(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted text-[11px] font-medium"
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
            className="fill-muted text-[11px] font-medium"
          >
            {formatHqTick(tick.t, locale)}
          </text>
        ))}

        {/* Gradient production fill */}
        <path d={chart.prodArea} fill="url(#prodTrendGrad)" />

        {/* Production line */}
        <path
          d={chart.prodLine}
          fill="none"
          stroke="#009aff"
          strokeWidth="2.25"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Demand dashed line */}
        {chart.demandLine ? (
          <path
            d={chart.demandLine}
            fill="none"
            className="stroke-ink/80"
            strokeWidth="1.75"
            strokeDasharray="4 4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}

        {/* Crosshair indicator */}
        <line
          x1={active.x}
          x2={active.x}
          y1={PAD.t}
          y2={H - PAD.b}
          className="stroke-ink/40"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Points on crosshair */}
        {active.prod != null ? (
          <g>
            <circle cx={active.x} cy={chart.yAt(active.prod)} r="4.5" fill="#009aff" />
            <circle cx={active.x} cy={chart.yAt(active.prod)} r="2" fill="#ffffff" />
          </g>
        ) : null}

        {active.demand != null ? (
          <g>
            <circle cx={active.x} cy={chart.yAt(active.demand)} r="4.5" className="fill-ink" />
            <circle cx={active.x} cy={chart.yAt(active.demand)} r="2" className="fill-card" />
          </g>
        ) : null}
      </svg>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted sm:text-sm">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="h-1.5 w-4 rounded-full bg-[#009aff]" />
            {t.production}
          </span>
          <span className="inline-flex items-center gap-2 font-medium">
            <span className="h-0.5 w-4 border-t border-dashed border-ink/80" />
            {t.demand}
          </span>
        </div>
        <p className="text-xs text-muted hidden sm:block">
          {locale === "fr" ? "Glisser sur le graphique pour inspecter" : "Scrub across chart to inspect"}
        </p>
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
