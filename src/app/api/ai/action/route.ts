import { NextResponse } from "next/server";
import { z } from "zod";
import { chatCompletionText, parseJsonObject } from "@/lib/server/ai-client";

const aiActionRequestSchema = z.object({
  action: z.enum(["chat", "premise", "angles", "setup", "punchline", "tag", "expand", "callback", "optimize", "repair", "rewrite", "polish"]),
  prompt: z.string().min(1),
  selectedText: z.string().optional(),
  activeBit: z
    .object({
      order: z.number().optional(),
      type: z.string().optional(),
      text: z.string().optional()
    })
    .optional(),
  show: z
    .object({
      title: z.string().optional(),
      bits: z.array(
        z.object({
          order: z.number().optional(),
          type: z.string().optional(),
          text: z.string()
        })
      )
    })
    .optional()
});

const aiActionResponseSchema = z.object({
  message: z.string(),
  insertText: z.string().optional(),
  insertHtml: z.string().optional(),
  type: z.string().optional(),
  title: z.string().optional(),
  actions: z
    .array(
      z.union([
        z.string(),
        z.object({
          label: z.string().optional(),
          prompt: z.string().optional()
        })
      ])
    )
    .optional()
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = aiActionRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI action request", issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const content = await chatCompletionText(
      [
        {
          role: "system",
          content: [
            "你是 RiffMaster 的中文单口喜剧编剧教练，擅长把真实经历打磨成可上台表演的段子。",
            "工作方式：先找真实态度，再找反常观察，再写短铺垫和强转折，最后补 Tag 与 Callback。",
            "禁止空泛建议，禁止鸡汤，禁止解释概念。每次必须产出可执行、可朗读、可插入稿件的内容。",
            "只返回紧凑 JSON，不要 Markdown。输出字段：message、insertText、insertHtml、type、title、actions。insertHtml 如无需要可省略。"
          ].join("\n")
        },
        {
          role: "user",
          content: buildActionPrompt(parsed.data)
        }
      ],
      { temperature: 0.55, maxTokens: 900 }
    );

    if (!content) {
      return NextResponse.json(
        {
          error: "AI action is not configured",
          message: "请配置 OPENAI_API_KEY 和 OPENAI_BASE_URL 后再使用 AI 优化。"
        },
        { status: 503 }
      );
    }

    const aiResult = aiActionResponseSchema.parse(parseJsonObject(content));
    return NextResponse.json({ ...normalizeActionResult(aiResult), source: "ai" });
  } catch (error) {
    console.error("AI action failed:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json(
      {
        error: "AI action failed",
        message: "AI 优化失败，请稍后重试或检查模型返回格式。",
        detail: error instanceof Error ? error.message : "unknown error"
      },
      { status: 502 }
    );
  }
}

function buildActionPrompt(input: z.infer<typeof aiActionRequestSchema>) {
  return JSON.stringify({
    task: actionInstruction(input.action),
    action: input.action,
    prompt: input.prompt,
    selectedText: input.selectedText,
    activeBit: input.activeBit,
    standupWritingWorkflow: [
      "1. Premise：一句话说清主题、人物处境和真实态度。",
      "2. Angle：找反常角度，不写大家都知道的观察。",
      "3. Setup：用最少信息建立常识、关系、场景和期待。",
      "4. Punchline：在最后 3-8 个字打破期待，句尾放最锋利的词。",
      "5. Tag：围绕同一个逻辑连续补 2-3 个更短的笑点。",
      "6. Callback：回扣前文高频词、人物身份或开场问题，形成闭环。",
      "7. Polish：删解释、删抽象词、加动作/表情/停顿，变成口语。"
    ],
    comedyStandards: [
      "每个生成段落要像中文口语，不像文章。",
      "优先使用：误导、身份错位、Rule of Three、比较升级、具体化、回扣。",
      "避免：网络段子腔、泛泛吐槽、过度解释、价值观总结、太长铺垫。",
      "如果原素材弱，要先指出最强可用角度，再生成一版。"
    ],
    show: {
      title: input.show?.title,
      bits: input.show?.bits.slice(0, 12)
    },
    outputRules: [
      "message 用 1-2 句说明这次选择的喜剧策略，例如误导、身份错位、回扣或升级。",
      "expand/callback/optimize/rewrite/repair 应尽量返回 insertText，可直接插入为新段落。",
      "premise/angles 可以不返回 insertText，但必须给具体可写方向；setup/punchline/tag/polish 必须尽量返回 insertText。",
      "type 只能从 SETUP、PUNCHLINE、TAGLINE、CALLBACK、OBSERVATIONAL、SELF_DEPRECATION 中选择。",
      "actions 给 1-3 个下一步按钮建议，必须符合脱口秀写作流程。",
      "insertText 最多 180 个中文字符，Punchline/Tag 尽量更短。"
    ]
  });
}

function actionInstruction(action: z.infer<typeof aiActionRequestSchema>["action"]) {
  const map = {
    chat: "像编剧教练一样回答用户问题，必须结合当前稿件给具体修改动作。",
    premise: "从素材中提炼一个脱口秀 Premise：主题、处境、真实态度、可冲突点。",
    angles: "围绕当前素材给 5 个不同喜剧角度，每个角度包含反常观察和可发展的笑点方向。",
    setup: "把素材写成简短 Setup，只保留观众理解笑点所需的信息。",
    punchline: "为当前 Setup 或素材生成 3 个 Punchline 候选，最好的一个放入 insertText。",
    tag: "围绕当前笑点补 2-3 个 Tag，逻辑连续、越来越短、越来越狠。",
    expand: "把用户的粗略想法扩写成一个可演出的单口段落，要有 Setup 和 Punchline。",
    callback: "基于当前稿件生成一个能回扣前文关键词、身份或开场问题的 Callback 段落。",
    optimize: "优化当前 Bit，保留原意，压缩铺垫，强化反转和句尾词。",
    repair: "根据分析问题生成修复方案，并给出可插入的新段落。",
    rewrite: "改写选中文本或当前段落，让笑点更清晰、更口语、更适合舞台。",
    polish: "润色当前段落：删解释、加停顿、强化动作和口语节奏。"
  };
  return map[action];
}

function normalizeActionResult(result: z.infer<typeof aiActionResponseSchema>) {
  return {
    ...result,
    message: result.message.trim(),
    insertText: result.insertText?.trim(),
    insertHtml: result.insertHtml?.trim(),
    type: normalizeType(result.type),
    actions: result.actions?.map((action) =>
      typeof action === "string"
        ? { label: action, prompt: action }
        : {
            label: action.label || action.prompt || "继续优化",
            prompt: action.prompt || action.label || "请继续优化这个方向"
          }
    )
  };
}

function normalizeType(type?: string) {
  const allowed = new Set(["SETUP", "PUNCHLINE", "TAGLINE", "CALLBACK", "OBSERVATIONAL", "SELF_DEPRECATION"]);
  const normalized = String(type || "OBSERVATIONAL").toUpperCase();
  return allowed.has(normalized) ? normalized : "OBSERVATIONAL";
}
