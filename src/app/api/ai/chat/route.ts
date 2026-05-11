import { NextResponse } from "next/server";
import { aiChatRequestSchema } from "@/lib/contracts";
import { localChatWithContext } from "@/lib/ai";
import { chatCompletionText } from "@/lib/server/ai-client";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = aiChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI chat request", issues: parsed.error.issues }, { status: 400 });
  }

  const fallback = await localChatWithContext(parsed.data.message);

  try {
    const content = await chatCompletionText(
      [
        {
          role: "system",
          content: [
            "你是 RiffMaster 的中文单口喜剧编剧教练。",
            "回答必须具体、短、可执行，优先给可直接写进稿子的句子，而不是泛泛建议。",
            "使用脱口秀工作流：Premise → Angle → Setup → Punchline → Tag → Callback → Polish。",
            "判断标准：是否有真实态度、是否有误导、句尾是否有反转词、铺垫是否过长、是否能上台口语化表达。",
            "如果用户问怎么改，必须给 1 个明确策略 + 1 段可替换示例 + 1 个下一步动作。"
          ].join("\n")
        },
        {
          role: "user",
          content: JSON.stringify({
            message: parsed.data.message,
            activeBitId: parsed.data.activeBitId,
            selectedText: parsed.data.selectedText
          })
        }
      ],
      { temperature: 0.55, maxTokens: 700 }
    );

    if (!content) {
      return NextResponse.json({ message: fallback, source: "local" });
    }

    return NextResponse.json({
      message: {
        ...fallback,
        content
      },
      source: "openai"
    });
  } catch (error) {
    console.error("AI chat failed, falling back to local chat:", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ message: fallback, source: "local", fallbackReason: "AI_CHAT_FAILED" });
  }
}
