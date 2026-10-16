import { describe, expect, it } from "vitest";
import {
  easternStamp,
  hourStartMs,
  parseCapability,
  parseDemandCsv,
  parseMonthly,
  parseRealtime,
  productionPoints,
  tradeFromIntertie,
} from "./ieso.ts";

function generator(fuel: string, outputs: number[]): string {
  const rows = outputs
    .map((mw, i) => `<Output><Hour>${i + 1}</Hour><EnergyMW>${mw}</EnergyMW></Output>`)
    .join("");
  // Capabilities repeat the same tags and must not be counted as output.
  return `<Generator><GeneratorName>X</GeneratorName><FuelType>${fuel}</FuelType><Outputs>${rows}</Outputs><Capabilities><Capability><Hour>1</Hour><EnergyMW>9999</EnergyMW></Capability></Capabilities></Generator>`;
}

describe("IESO time", () => {
  it("maps hour-ending EST to the Eastern wall clock", () => {
    // Hour 1 EST starts at 00:00 EST, which is 01:00 EDT in October.
    expect(easternStamp(hourStartMs("2026-10-15", 1))).toBe("2026-10-15T01:00:00");
    // In January EST and Eastern are the same clock.
    expect(easternStamp(hourStartMs("2026-01-15", 1))).toBe("2026-01-15T00:00:00");
    expect(easternStamp(hourStartMs("2026-10-15", 20, 25))).toBe("2026-10-15T20:25:00");
  });
});

describe("generation by fuel", () => {
  const xml = `<Document><Date>2026-10-15</Date><Generators>${[
    generator("NUCLEAR", [7000, 7100]),
    generator("NUCLEAR", [400, 400]),
    generator("GAS", [100, 200]),
    generator("BIOFUEL", [10, 10]),
    generator("OTHER", [5, 5]),
  ].join("")}</Generators></Document>`;

  it("sums hourly output per fuel and ignores capabilities", () => {
    const { date, hours } = parseCapability(xml);
    expect(date).toBe("2026-10-15");
    expect(hours.map((h) => h.hour)).toEqual([1, 2]);
    expect(hours[0]?.sources.nuclear).toBe(7400);
    expect(hours[1]?.sources.gas).toBe(200);
    expect(hours[0]?.sources.biomass).toBe(10);
    expect(hours[0]?.sources.unclassified).toBe(5);
  });

  it("turns hours into timestamped points", () => {
    const points = productionPoints(xml);
    expect(points).toHaveLength(2);
    expect(points[0]?.t).toBe("2026-10-15T01:00:00");
    expect(points[0]?.total).toBe(7400 + 100 + 10 + 5);
  });

  it("drops a newest hour that few generators have reported", () => {
    const gens = Array.from({ length: 10 }, () => generator("GAS", [10, 10]));
    gens.push(generator("GAS", [10, 10, 10]));
    // Hour 3 is only reported by one of eleven generators.
    const { hours } = parseCapability(
      `<Document><Date>2026-10-15</Date>${gens.join("")}</Document>`,
    );
    expect(hours.map((h) => h.hour)).toEqual([1, 2]);
  });
});

describe("demand", () => {
  it("reads Ontario Demand from the CSV and skips headers", () => {
    const rows = parseDemandCsv(
      "\\\\Hourly Demand Report,,,\nDate,Hour,Market Demand,Ontario Demand\n2026-01-01,1,19489,16526\n2026-01-01,2,19317,16374\n",
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]?.mw).toBe(16526);
    expect(easternStamp(rows[1]?.ms ?? 0)).toBe("2026-01-01T01:00:00");
  });

  it("reads 5-minute real-time demand", () => {
    const xml = `<Document><DeliveryDate>2026-10-15</DeliveryDate><DeliveryHour>20</DeliveryHour><Energies>
      <IntervalEnergy><Interval>1</Interval><MQ><MarketQuantity>Total Load</MarketQuantity><EnergyMW>19266.2</EnergyMW></MQ><MQ><MarketQuantity>ONTARIO DEMAND</MarketQuantity><EnergyMW>16836.2</EnergyMW></MQ></IntervalEnergy>
      <IntervalEnergy><Interval>2</Interval><MQ><MarketQuantity>ONTARIO DEMAND</MarketQuantity><EnergyMW>16900</EnergyMW></MQ></IntervalEnergy>
    </Energies></Document>`;
    const rows = parseRealtime(xml);
    expect(rows.map((r) => r.mw)).toEqual([16836.2, 16900]);
    expect(easternStamp(rows[1]?.ms ?? 0)).toBe("2026-10-15T20:05:00");
  });
});

describe("interties", () => {
  const zone = (name: string, flows: number[]) =>
    `<IntertieZone><IntertieZoneName>${name}</IntertieZoneName><Schedules></Schedules><Actuals>${flows
      .map((f, i) => `<Actual><Hour>5</Hour><Interval>${i + 1}</Interval><Flow>${f}</Flow></Actual>`)
      .join("")}</Actuals></IntertieZone>`;

  it("nets zones into neighbouring markets, positive meaning export", () => {
    const xml = `<Document><Date>2026-10-15</Date>${[
      zone("MANITOBA", [-100, -110]),
      zone("MANITOBA SK", [-5, -5]),
      zone("MICHIGAN", [300, 320]),
      zone("MINNESOTA", [0, 0]),
      zone("NEW-YORK", [50, -40]),
      zone("PQ.AT", [-200, -210]),
      zone("PQ.D4Z", [20, 30]),
    ].join("")}</Document>`;
    const trade = tradeFromIntertie(xml);
    expect(trade).not.toBeNull();
    const by = Object.fromEntries((trade?.markets ?? []).map((m) => [m.key, m]));
    expect(by.manitoba).toMatchObject({ exportMw: 0, importMw: 115 });
    expect(by.michigan).toMatchObject({ exportMw: 320, importMw: 0 });
    expect(by.newyork).toMatchObject({ exportMw: 0, importMw: 40 });
    expect(by.quebec).toMatchObject({ exportMw: 0, importMw: 180 });
    expect(trade?.exportTotal).toBe(320);
    expect(trade?.importTotal).toBe(335);
    expect(trade?.net).toBe(-15);
    // Hour 5 interval 2 starts 04:05 EST, which is 05:05 EDT.
    expect(trade?.at).toBe("2026-10-15T05:05:00");
  });

  it("returns null when no actuals are published", () => {
    expect(tradeFromIntertie("<Document><Date>2026-10-15</Date></Document>")).toBeNull();
  });
});

describe("annual mix", () => {
  it("sums monthly GWh into MWh", () => {
    const month = (nuclear: number, gas: number) =>
      `<MonthData><Month>X</Month><FuelTotal><Fuel>NUCLEAR</Fuel><EnergyGW>${nuclear}</EnergyGW></FuelTotal><FuelTotal><Fuel>GAS</Fuel><EnergyGW>${gas}</EnergyGW></FuelTotal></MonthData>`;
    const year = parseMonthly(`<Document>${month(60, 10)}${month(30, 20)}</Document>`);
    expect(year?.sources.nuclear).toBe(90_000);
    expect(year?.totalMwh).toBe(120_000);
    expect(year?.renewablePct).toBe(0);
  });
});
