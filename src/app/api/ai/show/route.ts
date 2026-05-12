import { NextResponse } from "next/server";
import { z } from "zod";
import { chatCompletionText, parseJsonObject } from "@/lib/server/ai-client";

const bitTypes = ["SETUP", "PUNCHLINE", "TAGLINE", "CALLBACK", "OBSERVATIONAL", "SELF_DEPRECATION"] as const;

const generateShowRequestSchema = z.object({
  topic: z.string().min(1),
  style: z.string().optional(),
  durationMinutes: z.number().min(3).max(90).optional(),
  audience: z.string().optional(),
  persona: z.string().optional(),
  constraints: z.string().optional()
});

const generatedShowSchema = z.object({
  title: z.string(),
  premise: z.string(),
  outline: z.array(z.string()),
  materials: z.array(z.string()).optional(),
  bits: z.array(
    z.object({
      type: z.enum(bitTypes),
      text: z.string(),
      note: z.string().optional()
    })
  ).min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = generateShowRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid show generation request", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const content = await chatCompletionText(
      [
        {
          role: "system",
          content: [
            "你是 RiffMaster 的中文单口喜剧总编剧。",
            "目标：把用户给的主题从 0 生成一篇可继续编辑的脱口秀初稿。",
            "必须按脱口秀结构写：开场 Hook、Premise、Setup、Punchline、Tag、转场、Callback、结尾。",
            "不要写成散文，不要鸡汤，不要只给建议。必须生成可上台朗读的段落。",
            "只返回 JSON，不要 Markdown。"
          ].join("\n")
        },
        {
          role: "user",
          content: buildPrompt(parsed.data)
        }
      ],
      { temperature: 0.6, maxTokens: 2200, timeoutMs: 90000 }
    );

    if (!content) {
      return NextResponse.json(
        {
          error: "AI show generation is not configured",
          message: "请配置 OPENAI_API_KEY 和 OPENAI_BASE_URL 后再生成脱口秀。"
        },
        { status: 503 }
      );
    }

    const generated = generatedShowSchema.parse(normalizeModelShow(parseJsonObject(content)));
    return NextResponse.json({ ...normalizeShow(generated), source: "ai" });
  } catch (error) {
    console.error("AI show generation failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      {
        error: "AI show generation failed",
        message: "AI 生成失败，请稍后重试或检查模型返回格式。",
        detail: error instanceof Error ? error.message : "unknown error"
      },
      { status: 502 }
    );
  }
}

function buildPrompt(input: z.infer<typeof generateShowRequestSchema>) {
  return JSON.stringify({
    task: "从 0 生成一篇中文脱口秀初稿。",
    input,
    requirements: [
      "title 要像节目标题，不超过 18 个字。",
      "premise 一句话说明主题、处境、真实态度和冲突。",
      "outline 给 5-8 个结构节点。",
      "bits 生成 8-12 段，每段 40-140 字。",
      "每段 type 必须严格从 SETUP/PUNCHLINE/TAGLINE/CALLBACK/OBSERVATIONAL/SELF_DEPRECATION 中选择，不允许使用 HOOK、PREMISE、TAG、TRANSITION 等其他值。",
      "前两段要有开场 Hook 和 Premise。",
      "中间要有具体场景、人物关系和反常观察。",
      "至少 2 段 PUNCHLINE，至少 2 段 TAGLINE，最后必须有 CALLBACK。",
      "语言必须口语化，像台上说话。避免泛泛吐槽和价值观总结。"
    ],
    outputShape: {
      title: "string",
      premise: "string",
      outline: ["string"],
      materials: ["string"],
      bits: [{ type: "SETUP", text: "string", note: "string" }]
    }
  });
}

function normalizeModelShow(raw: unknown) {
  const record = isRecord(raw) ? raw : {};
  const bits = Array.isArray(record.bits) ? record.bits : [];
  return {
    ...record,
    title: stringOrDefault(record.title, "未命名节目"),
    premise: stringOrDefault(record.premise, ""),
    outline: Array.isArray(record.outline) ? record.outline.map(String).filter(Boolean) : [],
    materials: Array.isArray(record.materials) ? record.materials.map(String).filter(Boolean) : [],
    bits: bits.map((bit, index) => normalizeModelBit(bit, index)).filter((bit) => bit.text.trim())
  };
}

function normalizeModelBit(raw: unknown, index: number) {
  const bit = isRecord(raw) ? raw : {};
  const text = stringOrDefault(bit.text ?? bit.content ?? bit.html ?? bit.line, "");
  return {
    type: normalizeBitType(bit.type, index),
    text,
    note: typeof bit.note === "string" ? bit.note : undefined
  };
}

function normalizeBitType(value: unknown, index: number): (typeof bitTypes)[number] {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const direct = bitTypes.find((type) => type === normalized);
  if (direct) return direct;

  const aliases: Record<string, (typeof bitTypes)[number]> = {
    HOOK: "SETUP",
    OPENING: "SETUP",
    OPENER: "SETUP",
    PREMISE: "SETUP",
    INTRO: "SETUP",
    INTRODUCTION: "SETUP",
    SET_UP: "SETUP",
    PUNCH: "PUNCHLINE",
    PUNCH_LINE: "PUNCHLINE",
    JOKE: "PUNCHLINE",
    TAG: "TAGLINE",
    TAG_LINE: "TAGLINE",
    CALLBACK_LINE: "CALLBACK",
    CALL_BACK: "CALLBACK",
    OBSERVATION: "OBSERVATIONAL",
    OBSERVATIONAL_COMEDY: "OBSERVATIONAL",
    SELF_DEPRECATION: "SELF_DEPRECATION",
    SELF_DEPRECATING: "SELF_DEPRECATION",
    SELF_MOCKING: "SELF_DEPRECATION",
    TRANSITION: "OBSERVATIONAL",
    BRIDGE: "OBSERVATIONAL",
    CLOSING: "CALLBACK",
    ENDING: "CALLBACK"
  };

  if (aliases[normalized]) return aliases[normalized];
  if (index === 0) return "SETUP";
  return "OBSERVATIONAL";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringOrDefault(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeShow(show: z.infer<typeof generatedShowSchema>) {
  return {
    title: show.title,
    premise: show.premise,
    outline: show.outline,
    materials: show.materials || [],
    bits: show.bits.map((bit) => ({
      ...bit,
      html: escapeHtml(bit.text),
      duration: `~${Math.max(10, Math.round(bit.text.length / 4))}秒`,
      score: "—"
    }))
  };
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
