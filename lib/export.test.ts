import { describe, expect, it } from "vitest";
import { toCsv } from "./export";

describe("CSV export", () => {
  it("preserves commas, quotes, Unicode, missing values and numeric precision", () => {
    expect(toCsv([['a,"b"', "מניה", null, -1.2345]])).toBe('"a,""b""","מניה","","-1.2345"');
  });
  it("neutralizes textual spreadsheet formulas without changing numeric returns", () => {
    expect(toCsv([["=HYPERLINK()", " +cmd", "@SUM()", "-formula", -2]])).toBe('"\'=HYPERLINK()","\' +cmd","\'@SUM()","\'-formula","-2"');
  });
});
