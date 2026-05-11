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

  const fallback = buildFallbackAction(parsed.data);

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

function buildFallbackAction(input: z.infer<typeof aiActionRequestSchema>) {
  const text = input.activeBit?.text || input.selectedText || input.prompt;
  if (input.action === "premise") {
    return {
      message: "先把素材压成一个可写的 Premise：一个人处在某个压力里，却产生了反常态度。",
      insertText: `Premise：我以为自己是在处理「${shortText(text)}」，其实是在证明我已经被这件事训练得很熟练。`,
      type: "SETUP",
      actions: [
        { label: "找 5 个角度", prompt: "请基于这个 Premise 找 5 个喜剧角度" },
        { label: "写 Setup", prompt: "请把这个 Premise 写成一个 Setup" }
      ]
    };
  }
  if (input.action === "angles") {
    return {
      message: "可以从身份错位、代价夸张、假装理性、童年经验和城市规训五个角度切。",
      insertText: "角度1：我不是在生活，是在参加一场收费很高的城市适应性测试。\n角度2：成年人最荒诞的地方，是能把委屈解释成成长。",
      type: "OBSERVATIONAL",
      actions: [{ label: "选角度写段落", prompt: "请选择最强角度写成完整 Bit" }]
    };
  }
  if (input.action === "setup") {
    return {
      message: "Setup 要短，只交代人物、场景和期待，不提前解释笑点。",
      insertText: `我第一次遇到这件事的时候，还以为自己处理得挺成熟。后来我发现，我只是已经熟练到能提前猜到它下一步怎么折磨我。`,
      type: "SETUP",
      actions: [{ label: "生成 Punchline", prompt: "请基于这个 Setup 生成 Punchline" }]
    };
  }
  if (input.action === "punchline") {
    return {
      message: "Punchline 的关键是把最反常的判断放到句尾。",
      insertText: "我当时才明白，这不是生活给我的考验，这是生活给我的续费提醒。",
      type: "PUNCHLINE",
      actions: [{ label: "补 Tag", prompt: "请围绕这个 Punchline 补 3 个 Tag" }]
    };
  }
  if (input.action === "tag") {
    return {
      message: "Tag 要沿着同一逻辑升级，短一点，像连续补刀。",
      insertText: "而且它还不是一次性收费，是订阅制。你不成长，它也自动扣款。",
      type: "TAGLINE",
      actions: [{ label: "做 Callback", prompt: "请把这个笑点回扣到前文关键词" }]
    };
  }
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
  if (input.action === "polish") {
    return {
      message: "润色重点是删解释、加停顿，把书面表达改成台上能说的话。",
      insertText: `${shortText(text)}。停一下。你以为这是成长，其实这是生活在确认：这人还能继续扣费。`,
      type: normalizeType(input.activeBit?.type),
      actions: [{ label: "再狠一点", prompt: "请把这段润色得更狠一点" }]
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

function shortText(text: string) {
  return text.replace(/\s+/g, " ").slice(0, 36);
}

function normalizeType(type?: string) {
  const allowed = new Set(["SETUP", "PUNCHLINE", "TAGLINE", "CALLBACK", "OBSERVATIONAL", "SELF_DEPRECATION"]);
  const normalized = String(type || "OBSERVATIONAL").toUpperCase();
  return allowed.has(normalized) ? normalized : "OBSERVATIONAL";
}
