export function stamp(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!match) return 0;
  const [, year, month, day, hour, minute] = match;
  return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
}

export function niceScale(maxValue: number, targetTicks = 4): { max: number; ticks: number[] } {
  const span = Math.max(maxValue, 1);
  const raw = span / targetTicks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const residual = raw / mag;
  const nice = residual <= 1 ? 1 : residual <= 2.5 ? 2 : residual <= 6 ? 5 : 10;
  const step = nice * mag;
  const max = Math.ceil(span / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= max + step / 2; value += step) ticks.push(value);
  return { max, ticks };
}

export function nearestIndex(values: number[], target: number): number {
  if (values.length === 0) return 0;
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < values.length; i++) {
    const dist = Math.abs(values[i] - target);
    if (dist < bestDist) {
      best = i;
      bestDist = dist;
    }
  }
  return best;
}

export function nearestValue(
  points: { x: number; y: number }[],
  target: number,
  maxGap: number,
): number | null {
  if (points.length === 0) return null;
  const point = points[nearestIndex(points.map((p) => p.x), target)];
  if (!point || Math.abs(point.x - target) > maxGap) return null;
  return point.y;
}

export function sampleTicks<T>(items: T[], count: number): T[] {
  if (items.length === 0 || count <= 0) return [];
  if (items.length <= count) return items;
  const ticks: T[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.round((i * (items.length - 1)) / (count - 1));
    const item = items[index];
    if (item !== undefined) ticks.push(item);
  }
  return ticks;
}

export type Matrix2D = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};

/** Map a screen point through the inverse SVG CTM into viewBox x. */
export function invertCtmX(clientX: number, clientY: number, ctm: Matrix2D): number | null {
  const det = ctm.a * ctm.d - ctm.b * ctm.c;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-8) return null;
  return (ctm.d * (clientX - ctm.e) - ctm.c * (clientY - ctm.f)) / det;
}

export function linePath(
  points: { x: number; y: number }[],
  xAt: (x: number) => number,
  yAt: (y: number) => number,
): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xAt(p.x).toFixed(1)} ${yAt(p.y).toFixed(1)}`)
    .join(" ");
}
