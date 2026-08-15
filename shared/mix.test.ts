import { describe, expect, it } from "vitest";
import {
  intensityGPerKwh,
  latestFilled,
  marketNet,
  pct,
  renewablePct,
  sourcesFromUnknown,
} from "./mix.ts";

describe("mix math", () => {
  it("maps HQ fields and ignores negatives", () => {
    const sources = sourcesFromUnknown({
      hydraulique: 14229,
      eolien: 729,
      autres: 891,
      solaire: 1,
      thermique: -3,
    });
    expect(sources.thermal).toBe(0);
    expect(renewablePct(sources, 15850)).toBeCloseTo(100, 0);
    expect(pct(14229, 15850)).toBeCloseTo(89.8, 1);
  });

  it("weights lifecycle intensity", () => {
    const g = intensityGPerKwh({
      hydro: 100,
      wind: 0,
      other: 0,
      solar: 0,
      thermal: 0,
    });
    expect(g).toBe(28);
  });

  it("splits signed intertie values", () => {
    expect(marketNet(1221)).toEqual({ exportMw: 1221, importMw: 0 });
    expect(marketNet(-780)).toEqual({ exportMw: 0, importMw: 780 });
  });

  it("picks the latest filled slot", () => {
    const latest = latestFilled(
      [
        { t: "a", total: 10 },
        { t: "b", total: 0 },
      ],
      (row) => row.total > 0,
    );
    expect(latest?.t).toBe("a");
  });
});
