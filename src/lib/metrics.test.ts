import { describe, expect, it } from "vitest";
import { initialBits } from "@/lib/mock-data";
import { calculateCompletionRate, calculateLaughDensity } from "@/lib/metrics";

describe("RiffMaster metrics", () => {
  it("calculates laugh density on a 0-10 scale", () => {
    expect(calculateLaughDensity(initialBits)).toBe(8);
  });

  it("calculates completion from filled bits and structure", () => {
    expect(calculateCompletionRate(initialBits)).toBeGreaterThan(80);
  });
});
