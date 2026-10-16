import { describe, expect, it } from "vitest";
import { parseCsd, parseUpdateStamp, tradeFromCsd } from "./aeso.ts";

const CSV = `Current Supply Demand Report

"Last Update : Oct 15, 2026 18:46"

"Alberta Total Net Generation","11251"
"Net Actual Interchange","259"
"Alberta Internal Load (AIL)","10,992"

"GROUP","MC","TNG","DCR"
"COGENERATION","6122","4172","78"
"WIND","5684","2079","0"
"COMBINED CYCLE","3974","3347","15"
"GAS FIRED STEAM","3078","956","0"
"SOLAR","1892","20","0"
"SIMPLE CYCLE","1014","416","40"
"HYDRO","896","104","133"
"OTHER","485","157","10"
"ENERGY STORAGE","270","0","168"
"TOTAL","23415","11251","444"

"PATH","ACTUAL FLOW"
"British Columbia","184"
"Montana","-2"
"Saskatchewan","77"
"TOTAL","259"

"<center><b>Hydro</b></center>"
"ASSET","MC","TNG","DCR"
"Bighorn (BIG)","120","999","0"
"HYDRO","1","1","1"
"Montana","1","1"
`;

describe("AESO supply-demand report", () => {
  it("reads the update stamp as a wall-clock string", () => {
    expect(parseUpdateStamp("Last Update : Oct 15, 2026 18:46")).toBe("2026-10-15T18:46:00");
    expect(parseUpdateStamp("Last Update : Jan 3, 2027 04:05")).toBe("2027-01-03T04:05:00");
    expect(parseUpdateStamp("nothing here")).toBeNull();
  });

  it("maps generation groups, load and interchange", () => {
    const csd = parseCsd(CSV);
    expect(csd?.at).toBe("2026-10-15T18:46:00");
    expect(csd?.loadMw).toBe(10992);
    expect(csd?.netGenerationMw).toBe(11251);
    expect(csd?.sources.cogeneration).toBe(4172);
    expect(csd?.sources.wind).toBe(2079);
    expect(csd?.sources.unclassified).toBe(157);
    // Asset tables after the group TOTAL must not overwrite the groups.
    expect(csd?.sources.hydro).toBe(104);
    expect(csd?.interchange).toEqual({ britishcolumbia: 184, montana: -2, saskatchewan: 77 });
  });

  it("treats positive interchange as export", () => {
    const csd = parseCsd(CSV);
    const trade = csd ? tradeFromCsd(csd) : null;
    const by = Object.fromEntries((trade?.markets ?? []).map((m) => [m.key, m]));
    expect(by.britishcolumbia).toMatchObject({ exportMw: 184, importMw: 0 });
    expect(by.montana).toMatchObject({ exportMw: 0, importMw: 2 });
    expect(trade?.net).toBe(259);
  });

  it("returns null for an unrecognised page", () => {
    expect(parseCsd("<html>maintenance</html>")).toBeNull();
  });
});
