import { describe, expect, it } from "vitest";
import { calculateCompletionRate, calculateLaughDensity } from "@/lib/metrics";
import type { Bit } from "@/types/riffmaster";

const metricFixtureBits: Bit[] = [
  {
    id: "bit-1",
    order: 1,
    type: "SETUP",
    title: "开场铺垫",
    html: "我以为自己只是换个工作，结果发现成年人每次换工作，都是在重新下载一遍人生插件。",
    plainText: "我以为自己只是换个工作，结果发现成年人每次换工作，都是在重新下载一遍人生插件。",
    expectedLaughPercent: 72,
    estimatedDurationSeconds: 30,
    reactions: { laugh: 12, smile: 5, flat: 1 },
    keywords: ["工作", "成年人"]
  },
  {
    id: "bit-2",
    order: 2,
    type: "PUNCHLINE",
    title: "核心笑点",
    html: "最尴尬的是，我离职那天很潇洒，第二天打开招聘软件，系统问我：欢迎回来。",
    plainText: "最尴尬的是，我离职那天很潇洒，第二天打开招聘软件，系统问我：欢迎回来。",
    expectedLaughPercent: 88,
    estimatedDurationSeconds: 26,
    reactions: { laugh: 24, smile: 4, flat: 0 },
    keywords: ["离职", "招聘"]
  },
  {
    id: "bit-3",
    order: 3,
    type: "CALLBACK",
    title: "结尾回扣",
    html: "所以我现在不叫换工作，我叫给人生插件打补丁，只是每次补丁都要我本人重启。",
    plainText: "所以我现在不叫换工作，我叫给人生插件打补丁，只是每次补丁都要我本人重启。",
    expectedLaughPercent: 84,
    estimatedDurationSeconds: 28,
    reactions: { laugh: 20, smile: 6, flat: 1 },
    keywords: ["插件", "重启"]
  }
];

describe("RiffMaster metrics", () => {
  it("calculates laugh density on a 0-10 scale", () => {
    expect(calculateLaughDensity(metricFixtureBits)).toBe(8.1);
  });

  it("calculates completion from filled bits and structure", () => {
    expect(calculateCompletionRate(metricFixtureBits)).toBeGreaterThan(80);
  });
});
