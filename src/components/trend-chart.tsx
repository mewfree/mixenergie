import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MixPayload, ProvinceId } from "../../shared/types.ts";
import type { Locale } from "../i18n.ts";
import { getDict } from "../i18n.ts";
import { invertCtmX, linePath, nearestIndex, nearestValue, niceScale, sampleTicks, stamp } from "../lib/chart.ts";
import { formatHqTick, formatMw, formatMwCompact } from "../lib/format.ts";
import { SectionHeader } from "./share-bars.tsx";

type Props = {
  province: ProvinceId;
  locale: Locale;
  data: MixPayload;
};

const FALLBACK_WIDTH = 640;
const PAD = { t: 12, r: 8, b: 28, l: 40 };

/** Track an element's content width so the SVG renders 1:1 in CSS pixels. */
function useWidth<T extends HTMLElement>(ready: boolean) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(Math.round(el.clientWidth));
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);
  return [ref, width] as const;
}

export function TrendChart({ province, locale, data }: Props) {
  const t = getDict(province, locale);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const hasData = data.series.production.length > 0;
  const [frameRef, measured] = useWidth<HTMLDivElement>(hasData);
  const W = measured || FALLBACK_WIDTH;
  const H = W < 520 ? 180 : 240;

  const chart = useMemo(
    () => layout(data.series.production, data.series.demand, W, H),
    [data.series.production, data.series.demand, W, H],
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
    <section className="border-t border-ink pt-4">
      <SectionHeader title={t.lastHours} meta={formatHqTick(active.t, locale)} />

      {/* Legend doubles as the scrubber readout */}
      <dl
        className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-sm tabular-nums"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-5 bg-accent" />
          <dt className="text-muted">{t.production}</dt>
          <dd className="font-semibold text-ink">
            {active.prod != null ? `${formatMw(active.prod, locale)} ${t.mw}` : "—"}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 border-t border-dashed border-ink" />
          <dt className="text-muted">{t.demand}</dt>
          <dd className="font-semibold text-ink">
            {active.demand != null ? `${formatMw(active.demand, locale)} ${t.mw}` : "—"}
          </dd>
        </div>
        {delta != null ? (
          <div
            className={`font-medium ${delta >= 0 ? "text-positive" : "text-caution"}`}
          >
            {delta >= 0 ? "+" : "−"}
            {formatMw(Math.abs(delta), locale)} {t.mw} · {delta >= 0 ? t.surplus : t.deficit}
          </div>
        ) : null}
      </dl>

      <div ref={frameRef} className="w-full">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block touch-none cursor-crosshair select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/50"
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
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {chart.yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={chart.yAt(tick)}
                y2={chart.yAt(tick)}
                className={tick === 0 ? "stroke-ink" : "stroke-line"}
                strokeWidth="1"
              />
              <text
                x={PAD.l - 8}
                y={chart.yAt(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-muted text-[11px] tabular-nums"
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
              className="fill-muted text-[11px] tabular-nums"
            >
              {formatHqTick(tick.t, locale)}
            </text>
          ))}

          <path d={chart.prodArea} fill="url(#prodTrendGrad)" />

          <path
            d={chart.prodLine}
            fill="none"
            className="stroke-accent"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {chart.demandLine ? (
            <path
              d={chart.demandLine}
              fill="none"
              className="stroke-ink"
              strokeWidth="1.25"
              strokeDasharray="4 3"
              strokeLinejoin="round"
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
            <circle
              cx={active.x}
              cy={chart.yAt(active.prod)}
              r="4"
              className="fill-accent stroke-paper"
              strokeWidth="2"
            />
          ) : null}

          {active.demand != null ? (
            <circle
              cx={active.x}
              cy={chart.yAt(active.demand)}
              r="4"
              className="fill-ink stroke-paper"
              strokeWidth="2"
            />
          ) : null}
        </svg>
      </div>

      <p className="mt-3 hidden text-xs text-muted sm:block">{t.scrubHint}</p>
    </section>
  );
}

function layout(
  production: MixPayload["series"]["production"],
  demand: MixPayload["series"]["demand"],
  W: number,
  H: number,
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
    xTicks: sampleTicks(points, W < 480 ? 3 : 5).map((p) => ({ t: p.t, x: p.x })),
    points,
    xs: points.map((p) => p.x),
  };
}
