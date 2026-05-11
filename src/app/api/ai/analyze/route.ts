import { NextResponse } from "next/server";
import { z } from "zod";

const analyzeRequestSchema = z.object({
  title: z.string().default("未命名节目"),
  bits: z.array(
    z.object({
      id: z.string().optional(),
      order: z.number().optional(),
      type: z.string().optional(),
      text: z.string()
    })
  )
});

const callbackWords = ["游客", "歪脖子树", "房租", "导航", "十年", "北京"];
const turnWords = ["但", "结果", "后来", "没想到", "真正", "以为", "只是", "最后"];

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = analyzeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analysis payload", issues: parsed.error.issues }, { status: 400 });
  }

  const { title, bits } = parsed.data;
  const analyzedBits = bits.map((bit, index) => {
    const score = scoreBit(bit.text);
    return {
      id: bit.id ?? `bit-${index + 1}`,
      order: bit.order ?? index + 1,
      type: bit.type ?? "BIT",
      score,
      pace: paceOf(bit.text),
      durationSeconds: Math.max(10, Math.round(bit.text.length / 4)),
      keywords: extractKeywords(bit.text).slice(0, 5),
      issues: bitIssues(bit.text),
      strengths: bitStrengths(bit.text)
    };
  });

  const wordCounts = countWords(bits.map((bit) => bit.text).join(" "));
  const suggestions = buildSuggestions(analyzedBits, wordCounts);
  const average = analyzedBits.length
    ? Number((analyzedBits.reduce((sum, bit) => sum + bit.score, 0) / analyzedBits.length).toFixed(1))
    : 0;

  return NextResponse.json({
    title,
    averageLaughDensity: average,
    completionRate: calculateCompletion(bits),
    callbackCount: bits.filter((bit) => callbackWords.some((word) => bit.text.includes(word))).length,
    peakLaughCount: analyzedBits.filter((bit) => bit.score >= 8).length,
    analyzedBits,
    densityBars: analyzedBits.map((bit) => ({
      label: `Bit${bit.order}`,
      value: bit.score,
      color: bit.score >= 8 ? "gold" : bit.score >= 6.5 ? "purple" : "orange"
    })),
    moodTimeline: buildMoodTimeline(analyzedBits),
    wordCloud: Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 14)
      .map(([word, count], index) => ({
        word,
        count,
        weight: Math.min(20, 11 + count * 2),
        color: ["purple", "gold", "pink", "teal", "orange", "red"][index % 6]
      })),
    repeatedWords: Object.entries(wordCounts)
      .filter(([, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({
        word,
        count,
        severity: count >= 8 ? "warning" : count >= 5 ? "notice" : "ok"
      })),
    emotionRadar: [
      { label: "自嘲", value: detectScore(bits, ["我", "自己", "尴尬", "紧张"]) },
      { label: "观察", value: detectScore(bits, ["发现", "北京", "地铁", "房租", "导航"]) },
      { label: "共情", value: detectScore(bits, ["你们", "我们", "有没有", "大家"]) },
      { label: "转折", value: detectScore(bits, turnWords) },
      { label: "荒诞", value: detectScore(bits, ["离谱", "抽象", "游客", "歪脖子树"]) },
      { label: "温情", value: detectScore(bits, ["妈妈", "房东", "感动", "眼眶"]) }
    ],
    suggestions,
    summary: buildSummary(average, analyzedBits, suggestions)
  });
}

function scoreBit(text: string) {
  let score = 4.8;
  if (turnWords.some((word) => text.includes(word))) score += 1.3;
  if (callbackWords.some((word) => text.includes(word))) score += 1.1;
  if (/[？?]/.test(text)) score += 0.4;
  if (text.length >= 35 && text.length <= 150) score += 1.1;
  if (text.length > 180) score -= 1.2;
  if (/我|妈|房东|北京/.test(text)) score += 0.5;
  return Math.max(1, Math.min(10, Number(score.toFixed(1))));
}

function paceOf(text: string) {
  if (text.length < 30) return "偏短，适合做 Tagline";
  if (text.length > 170) return "偏慢，需要压缩铺垫";
  return "节奏适中";
}

function bitIssues(text: string) {
  const issues: string[] = [];
  if (text.length > 170) issues.push("铺垫偏长");
  if (!turnWords.some((word) => text.includes(word))) issues.push("缺少明显转折词");
  if (text.length < 20) issues.push("信息量偏少");
  return issues;
}

function bitStrengths(text: string) {
  const strengths: string[] = [];
  if (callbackWords.some((word) => text.includes(word))) strengths.push("具备回扣关键词");
  if (turnWords.some((word) => text.includes(word))) strengths.push("有反转结构");
  if (/我|妈|房东/.test(text)) strengths.push("个人叙事较强");
  return strengths;
}

function buildSuggestions(bits: Array<{ order: number; score: number; issues: string[]; keywords: string[] }>, counts: Record<string, number>) {
  if (!bits.length) {
    return [
      {
        type: "structure",
        priority: "建议",
        title: "先补充 3 个以上段落",
        description: "AI 需要足够的铺垫、笑点和收尾内容才能判断节奏弧线。",
        relatedOrder: 1
      }
    ];
  }

  const weakest = bits.reduce((a, b) => (b.score < a.score ? b : a), bits[0]);
  const strongest = bits.reduce((a, b) => (b.score > a.score ? b : a), bits[0]);
  const topWord = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return [
    strongest
      ? {
          type: "strength",
          priority: "高优",
          title: `第${strongest.order}段是当前强笑点`,
          description: "这段具备较强反转或回扣关键词，建议演出时给足停顿。",
          relatedOrder: strongest.order
        }
      : null,
    weakest
      ? {
          type: "optimize",
          priority: "优化",
          title: `第${weakest.order}段最需要优化`,
          description: weakest.issues.length ? weakest.issues.join("，") : "建议增加一个更清晰的反转句。",
          relatedOrder: weakest.order
        }
      : null,
    topWord
      ? {
          type: "callback",
          priority: "亮点",
          title: `Callback 机会：「${topWord[0]}」`,
          description: `该词出现 ${topWord[1]} 次，适合在结尾做回扣。`,
          relatedOrder: bits.length
        }
      : null
  ].filter(Boolean);
}

function buildMoodTimeline(bits: Array<{ score: number }>) {
  const chunks = ["0-2min", "2-5min", "5-9min", "9-14min", "14min+"];
  return chunks.map((time, index) => {
    const bit = bits[Math.min(index, bits.length - 1)];
    const value = bit ? Math.round(bit.score * 10) : 50;
    return {
      time,
      value,
      emoji: value >= 90 ? "🤣" : value >= 80 ? "😂" : value >= 65 ? "😄" : "😐"
    };
  });
}

function extractKeywords(text: string) {
  const stop = new Set(["这个", "那个", "就是", "因为", "所以", "然后", "你们", "我们"]);
  return (text.match(/[\u4e00-\u9fa5]{2,6}/g) ?? []).filter((word) => !stop.has(word));
}

function countWords(text: string) {
  return extractKeywords(text).reduce<Record<string, number>>((map, word) => {
    map[word] = (map[word] ?? 0) + 1;
    return map;
  }, {});
}

function calculateCompletion(bits: Array<{ text: string }>) {
  if (!bits.length) return 0;
  return Math.min(100, Math.round((bits.filter((bit) => bit.text.length > 20).length / bits.length) * 80 + 12));
}

function detectScore(bits: Array<{ text: string }>, words: string[]) {
  const text = bits.map((bit) => bit.text).join("");
  const hits = words.filter((word) => text.includes(word)).length;
  return Math.max(1, Math.min(10, hits * 2));
}

function buildSummary(average: number, bits: Array<{ score: number }>, suggestions: unknown[]) {
  if (!bits.length) return "当前稿件为空，建议先添加至少 3 个 Bit。";
  if (average >= 8) return `整体笑点密度 ${average}/10，已经适合进入排练，建议重点检查停顿和 Callback。`;
  if (suggestions.length) return `整体笑点密度 ${average}/10，建议先处理弱段和回扣机会。`;
  return `整体笑点密度 ${average}/10，建议增加更明确的反转词和个人化细节。`;
}
