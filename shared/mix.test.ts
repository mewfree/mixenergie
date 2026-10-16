import { describe, expect, it } from "vitest";
import {
  emptySources,
  intensityGPerKwh,
  latestFilled,
  lowCarbonPct,
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
    expect(renewablePct(sources, "qc", 15850)).toBeCloseTo(100, 0);
    expect(pct(14229, 15850)).toBeCloseTo(89.8, 1);
  });

  it("weights lifecycle intensity", () => {
    const g = intensityGPerKwh({ ...emptySources(), hydro: 100 }, "qc");
    expect(g).toBe(28);
  });

  it("uses Ontario factors and skips unclassified output", () => {
    const sources = { ...emptySources(), nuclear: 50, gas: 50, unclassified: 400 };
    expect(intensityGPerKwh(sources, "on")).toBeCloseTo((50 * 12 + 50 * 490) / 100, 5);
  });

  it("counts nuclear as low carbon but not renewable in Ontario", () => {
    const sources = { ...emptySources(), nuclear: 60, hydro: 20, gas: 20 };
    expect(renewablePct(sources, "on")).toBeCloseTo(20, 5);
    expect(lowCarbonPct(sources, "on")).toBeCloseTo(80, 5);
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
