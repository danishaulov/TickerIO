import { describe, expect, it } from "vitest";
import { searchPopoverPosition } from "./search-popover";

describe("search results placement", () => {
  const anchor = { left: 700, right: 1020, top: 12, bottom: 56, width: 320 };
  it("stays below a sticky header input and gives company names more room", () => {
    expect(searchPopoverPosition(anchor, { left: 0, top: 0, width: 1440, height: 900 }))
      .toEqual({ left: 580, top: 64, width: 440, maxHeight: 440 });
  });
  it("fits a narrow mobile viewport without horizontal overflow", () => {
    const box = searchPopoverPosition({ left: 16, right: 344, top: 80, bottom: 124, width: 328 }, { left: 0, top: 0, width: 360, height: 740 });
    expect(box.left).toBe(12);
    expect(box.width).toBe(336);
    expect(box.top).toBe(132);
  });
  it("shortens the scrollable results when a mobile keyboard opens", () => {
    const box = searchPopoverPosition(anchor, { left: 0, top: 0, width: 1440, height: 260 });
    expect(box.top).toBe(64);
    expect(box.maxHeight).toBe(184);
  });
  it("clamps the panel near the left edge", () => {
    expect(searchPopoverPosition({ ...anchor, left: 20, right: 340 }, { left: 0, top: 0, width: 1024, height: 700 }).left).toBe(12);
  });
  it("respects a shifted visual viewport when zoomed", () => {
    const box = searchPopoverPosition(anchor, { left: 600, top: 10, width: 400, height: 400 });
    expect(box.left).toBe(612);
    expect(box.left + box.width).toBe(988);
    expect(box.top + box.maxHeight).toBe(398);
  });
  it("never produces a negative height near the viewport edge", () => {
    expect(searchPopoverPosition(anchor, { left: 0, top: 0, width: 360, height: 50 }).maxHeight).toBe(0);
  });
});
