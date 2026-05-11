import { NextResponse } from "next/server";
import { aiChatRequestSchema } from "@/lib/contracts";
import { mockChatWithContext } from "@/lib/ai";
import { chatCompletionText } from "@/lib/server/ai-client";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = aiChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI chat request", issues: parsed.error.issues }, { status: 400 });
  }

  const fallback = await mockChatWithContext(parsed.data.message);

  try {
    const content = await chatCompletionText(
      [
        {
          role: "system",
          content:
            "你是 RiffMaster 的中文单口喜剧创作助手。回答要具体、短、可执行，优先给结构建议、句子改写和舞台处理。"
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
