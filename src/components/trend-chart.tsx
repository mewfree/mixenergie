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
    <section className="rounded-xl border border-line/70 bg-card p-5 sm:p-6 transition-colors">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{t.lastHours}</h2>
          <p className="mt-0.5 text-xs tabular-nums text-muted">
            {formatHqTick(active.t, locale)}
          </p>
        </div>

        {/* Interactive scrubber HUD */}
        <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums" aria-live="polite">
          {active.prod != null ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-line/70 bg-paper/50 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-muted">{t.production} :</span>
              <strong className="font-semibold text-ink">{formatMw(active.prod, locale)} {t.mw}</strong>
            </span>
          ) : null}
          {active.demand != null ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-line/70 bg-paper/50 px-2.5 py-1">
              <span className="h-2 w-2 rounded-full border border-ink" />
              <span className="text-muted">{t.demand} :</span>
              <strong className="font-semibold text-ink">{formatMw(active.demand, locale)} {t.mw}</strong>
            </span>
          ) : null}
          {delta != null ? (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium ${
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
        className="h-48 w-full touch-none cursor-crosshair select-none focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/40 sm:h-56"
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
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.10" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {chart.yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={chart.yAt(tick)}
              y2={chart.yAt(tick)}
              className="stroke-line/50"
              strokeWidth="1"
              strokeDasharray="2 3"
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

        {/* Soft production fill */}
        <path d={chart.prodArea} fill="url(#prodTrendGrad)" />

        {/* Production line */}
        <path
          d={chart.prodLine}
          fill="none"
          className="stroke-accent"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Demand dashed line */}
        {chart.demandLine ? (
          <path
            d={chart.demandLine}
            fill="none"
            className="stroke-ink/60"
            strokeWidth="1.5"
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
          className="stroke-ink/25"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Points on crosshair */}
        {active.prod != null ? (
          <g>
            <circle cx={active.x} cy={chart.yAt(active.prod)} r="4" className="fill-accent" />
            <circle cx={active.x} cy={chart.yAt(active.prod)} r="1.75" fill="#ffffff" />
          </g>
        ) : null}

        {active.demand != null ? (
          <g>
            <circle cx={active.x} cy={chart.yAt(active.demand)} r="4" className="fill-ink" />
            <circle cx={active.x} cy={chart.yAt(active.demand)} r="1.75" className="fill-card" />
          </g>
        ) : null}
      </svg>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-muted">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <span className="h-1 w-3.5 rounded-full bg-accent" />
            {t.production}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-ink">
            <span className="h-0.5 w-3.5 border-t border-dashed border-ink/70" />
            {t.demand}
          </span>
        </div>
        <p className="text-xs text-muted hidden sm:block">
          {t.scrubHint}
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
  const all = [...prodPts, ...demandPts];
  const x0 = Math.min(...all.map((p) => p.x));
  const x1 = Math.max(...all.map((p) => p.x));
  const yScale = niceScale(Math.max(1, ...all.map((p) => p.y)));
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const xAt = (x: number) => PAD.l + ((x - x0) / Math.max(x1 - x0, 1)) * innerW;
  const yAt = (y: number) => PAD.t + innerH - (y / yScale.max) * innerH;

  const prodLine = linePath(prodPts, xAt, yAt);
  const baseline = PAD.t + innerH;
  const prodX = prodPts.map((p) => p.x);
  const prodArea = `${prodLine} L${xAt(Math.max(...prodX))} ${baseline} L${xAt(Math.min(...prodX))} ${baseline} Z`;

  const times = new Map<number, string>();
  for (const point of all) {
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
