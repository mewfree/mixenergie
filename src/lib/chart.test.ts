import { describe, expect, it } from "vitest";
import { invertCtmX, nearestIndex, nearestValue, niceScale, sampleTicks, stamp } from "./chart.ts";

describe("niceScale", () => {
  it("rounds 22800 to a 5 000-step axis", () => {
    const scale = niceScale(22800, 4);
    expect(scale.max).toBe(25000);
    expect(scale.ticks).toEqual([0, 5000, 10000, 15000, 20000, 25000]);
  });

  it("never returns an empty domain", () => {
    expect(niceScale(0).max).toBeGreaterThan(0);
    expect(niceScale(0).ticks[0]).toBe(0);
  });
});

describe("nearestIndex", () => {
  it("snaps to the closest value", () => {
    expect(nearestIndex([0, 10, 20], 14)).toBe(1);
    expect(nearestIndex([0, 10, 20], 18)).toBe(2);
    expect(nearestIndex([], 3)).toBe(0);
  });
});

describe("nearestValue", () => {
  const points = [
    { x: 0, y: 10 },
    { x: 10, y: 20 },
  ];

  it("returns the closest y within the gap", () => {
    expect(nearestValue(points, 12, 5)).toBe(20);
    expect(nearestValue(points, 12, 1)).toBeNull();
    expect(nearestValue([], 1, 10)).toBeNull();
  });
});

describe("sampleTicks", () => {
  it("keeps ends and spreads the rest", () => {
    expect(sampleTicks([0, 1, 2, 3, 4, 5, 6, 7], 5)).toEqual([0, 2, 4, 5, 7]);
  });
});

describe("invertCtmX", () => {
  it("undoes letterboxing so edges are not compressed toward the center", () => {
    const viewW = 640;
    const viewH = 196;
    const svgW = 900;
    const svgH = 192;
    const scale = svgH / viewH;
    const offsetX = (svgW - viewW * scale) / 2;
    const ctm = { a: scale, b: 0, c: 0, d: scale, e: offsetX, f: 0 };

    expect(invertCtmX(offsetX, 0, ctm)).toBeCloseTo(0);
    expect(invertCtmX(offsetX + viewW * scale, 0, ctm)).toBeCloseTo(viewW);
    expect(invertCtmX(svgW / 2, 0, ctm)).toBeCloseTo(viewW / 2);

    const naiveRight = (offsetX + viewW * scale) / svgW * viewW;
    expect(naiveRight).toBeLessThan(viewW - 40);
  });
});

describe("stamp", () => {
  it("parses HQ eastern timestamps as UTC numbers", () => {
    expect(stamp("2026-08-13T14:00:00")).toBe(Date.UTC(2026, 7, 13, 14, 0));
    expect(stamp("bad")).toBe(0);
  });
});
