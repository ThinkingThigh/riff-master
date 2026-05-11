import { NextResponse } from "next/server";
import { z } from "zod";
import { chatCompletionText, parseJsonObject } from "@/lib/server/ai-client";

const aiActionRequestSchema = z.object({
  action: z.enum(["chat", "expand", "callback", "optimize", "repair", "rewrite"]),
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

  const fallback = buildFallbackAction(parsed.data);

  try {
    const content = await chatCompletionText(
      [
        {
          role: "system",
          content:
            "你是 RiffMaster 的中文单口喜剧创作助手。只返回紧凑 JSON，不要 Markdown。输出字段：message、insertText、insertHtml、type、title、actions。insertHtml 如无需要可省略。"
        },
        {
          role: "user",
          content: buildActionPrompt(parsed.data)
        }
      ],
      { temperature: 0.55, maxTokens: 900 }
    );

    if (!content) {
      return NextResponse.json({ ...fallback, source: "local" });
    }

    const aiResult = aiActionResponseSchema.parse(parseJsonObject(content));
    return NextResponse.json({ ...fallback, ...normalizeActionResult(aiResult), source: "openai" });
  } catch (error) {
    console.error("AI action failed, falling back to local action:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ ...fallback, source: "local", fallbackReason: "AI_ACTION_FAILED" });
  }
}

function buildActionPrompt(input: z.infer<typeof aiActionRequestSchema>) {
  return JSON.stringify({
    task: actionInstruction(input.action),
    action: input.action,
    prompt: input.prompt,
    selectedText: input.selectedText,
    activeBit: input.activeBit,
    show: {
      title: input.show?.title,
      bits: input.show?.bits.slice(0, 12)
    },
    outputRules: [
      "message 是给用户看的简短解释。",
      "expand/callback/optimize/rewrite/repair 应尽量返回 insertText，可直接插入为新段落。",
      "type 只能从 SETUP、PUNCHLINE、TAGLINE、CALLBACK、OBSERVATIONAL、SELF_DEPRECATION 中选择。",
      "actions 给 1-3 个后续按钮建议。"
    ]
  });
}

function actionInstruction(action: z.infer<typeof aiActionRequestSchema>["action"]) {
  const map = {
    chat: "回答用户关于当前节目、结构、笑点、节奏的问题。",
    expand: "把用户的粗略想法扩写成一个可演出的单口段落。",
    callback: "基于当前稿件生成一个能回扣前文关键词的 Callback 段落。",
    optimize: "优化当前 Bit，保留原意，压缩铺垫，强化反转和句尾。",
    repair: "根据分析问题生成修复方案，并给出可插入的新段落。",
    rewrite: "改写选中文本或当前段落，让笑点更清晰。"
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

function buildFallbackAction(input: z.infer<typeof aiActionRequestSchema>) {
  const text = input.activeBit?.text || input.selectedText || input.prompt;
  if (input.action === "callback") {
    return {
      message: "我建议用一个身份回扣收尾：把前文高频词放到最后一句，形成闭环。",
      insertText: "后来我才明白，真正让我留在这里的不是梦想，是每次想离开时，生活都会突然给我一个更荒诞的理由。",
      type: "CALLBACK",
      actions: [{ label: "换个更自嘲的角度", prompt: "请换成更自嘲的 Callback" }]
    };
  }
  if (input.action === "expand") {
    return {
      message: "我把这个想法扩成了一个可继续打磨的段落。",
      insertText: `${text}。真正好笑的不是这件事发生了，而是我当时居然认真地觉得：这可能就是成年人必须经历的成长。`,
      type: "OBSERVATIONAL",
      actions: [{ label: "再压缩一点", prompt: "请把这段压缩成更短的舞台版本" }]
    };
  }
  if (input.action === "optimize" || input.action === "rewrite") {
    return {
      message: "建议压缩铺垫，把最反常的判断放到句尾。",
      insertText: `${text} 但最荒诞的是，我以为这是生活给我的考验，后来发现这只是生活在提醒我：别太把自己当主角。`,
      type: normalizeType(input.activeBit?.type),
      actions: [{ label: "生成更强 Punchline", prompt: "请把这段改成更强的 Punchline" }]
    };
  }
  return {
    message: "我建议先明确铺垫、反转和回扣三步：前一句建立常识，后一句打破预期，最后用关键词收束。",
    actions: [
      { label: "生成示例", prompt: "请基于这个方向生成一个可插入的新 Bit" },
      { label: "换个角度", prompt: "请换成更自嘲的角度分析" }
    ]
  };
}

function normalizeType(type?: string) {
  const allowed = new Set(["SETUP", "PUNCHLINE", "TAGLINE", "CALLBACK", "OBSERVATIONAL", "SELF_DEPRECATION"]);
  const normalized = String(type || "OBSERVATIONAL").toUpperCase();
  return allowed.has(normalized) ? normalized : "OBSERVATIONAL";
}
