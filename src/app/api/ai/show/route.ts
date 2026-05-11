import { NextResponse } from "next/server";
import { z } from "zod";
import { chatCompletionText, parseJsonObject } from "@/lib/server/ai-client";

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
      type: z.enum(["SETUP", "PUNCHLINE", "TAGLINE", "CALLBACK", "OBSERVATIONAL", "SELF_DEPRECATION"]),
      text: z.string(),
      note: z.string().optional()
    })
  )
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = generateShowRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid show generation request", issues: parsed.error.issues }, { status: 400 });
  }

  const fallback = buildFallbackShow(parsed.data);

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

    if (!content) return NextResponse.json({ ...fallback, source: "local" });

    const generated = generatedShowSchema.parse(parseJsonObject(content));
    return NextResponse.json({ ...normalizeShow(generated), source: "openai" });
  } catch (error) {
    console.error("AI show generation failed, falling back to local show:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ ...fallback, source: "local", fallbackReason: "AI_SHOW_FAILED" });
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
      "每段 type 从 SETUP/PUNCHLINE/TAGLINE/CALLBACK/OBSERVATIONAL/SELF_DEPRECATION 选择。",
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
      score: bit.type === "PUNCHLINE" || bit.type === "CALLBACK" ? "82%" : "—"
    }))
  };
}

function buildFallbackShow(input: z.infer<typeof generateShowRequestSchema>) {
  const topic = input.topic.trim();
  return {
    title: `${topic.slice(0, 12)}这件事`,
    premise: `我以为自己是在讲${topic}，其实是在讲一个人如何把荒诞解释成成长。`,
    outline: ["开场 Hook", "真实处境", "反常观察", "第一次升级", "更私人化的自嘲", "Callback 收尾"],
    materials: [topic, input.style || "观察喜剧", input.audience || "普通观众"],
    bits: [
      {
        type: "SETUP",
        text: `我最近一直在想${topic}这件事。最可怕的不是它发生了，而是我发现自己已经熟练到可以提前预测它怎么折磨我。`,
        html: escapeHtml(`我最近一直在想${topic}这件事。最可怕的不是它发生了，而是我发现自己已经熟练到可以提前预测它怎么折磨我。`),
        duration: "~32秒",
        score: "—"
      },
      {
        type: "PUNCHLINE",
        text: "这不是生活给我的考验，这是生活给我的续费提醒。",
        html: escapeHtml("这不是生活给我的考验，这是生活给我的续费提醒。"),
        duration: "~14秒",
        score: "82%"
      },
      {
        type: "CALLBACK",
        text: `所以我现在看${topic}，已经没有情绪了。我只想问一句：这个体验包，能不能取消自动续费？`,
        html: escapeHtml(`所以我现在看${topic}，已经没有情绪了。我只想问一句：这个体验包，能不能取消自动续费？`),
        duration: "~28秒",
        score: "86%"
      }
    ],
    source: "local"
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
