import { aiOptimizeResultSchema } from "@/lib/contracts";
import type { AIMessage, AIOptimizeResult, Bit, Show } from "@/types/riffmaster";

const replies = [
  "好问题！这部分的关键在于 Rule of Three：前两个细节建立规律，第三个细节突然打破观众预期。建议把最荒诞的词放在句尾。",
  "我建议先明确你的真实态度：不是发生了什么，而是你为什么被这件事冒犯、击中或逗笑。这个态度会决定 Punchline 的方向。",
  "从结构看，可以先用一个短 Hook 建立处境，再用具体细节铺垫，最后把最反常、最丢脸或最荒诞的词放到句尾。"
];

export async function localChatWithContext(message: string): Promise<AIMessage> {
  await delay(600);
  const content = replies[Math.abs(hash(message)) % replies.length];
  return {
    id: `msg-${Date.now()}`,
    role: "assistant",
    content,
    actions: [
      { id: `action-${Date.now()}-1`, label: "好的，生成", prompt: "基于这个方向生成一个可插入的新 Bit" },
      { id: `action-${Date.now()}-2`, label: "换个角度", prompt: "换一个更自嘲的角度分析" }
    ]
  };
}

export async function localOptimizeBit(bit: Bit, show: Show): Promise<AIOptimizeResult> {
  await delay(700);
  const result: AIOptimizeResult = {
    title: `优化 ${bit.title}`,
    suggestion: `建议保留「${bit.keywords[0] ?? show.topic}」作为锚点，把铺垫压缩 20%，并把反转词放到句尾。`,
    generatedBit: {
      type: bit.type,
      title: `${bit.title} · AI 改写`,
      html: `${bit.plainText} <strong>但真正可怕的是，我以为这是一个选择题，后来发现它是生活给我的阅读理解。</strong>`,
      plainText: `${bit.plainText} 但真正可怕的是，我以为这是一个选择题，后来发现它是生活给我的阅读理解。`,
      estimatedDurationSeconds: Math.max(20, bit.estimatedDurationSeconds),
      keywords: [...new Set([...bit.keywords, "反转"])]
    }
  };
  return aiOptimizeResultSchema.parse(result);
}

export async function localGenerateCallback(): Promise<AIOptimizeResult> {
  await delay(700);
  const result: AIOptimizeResult = {
    title: "生成 Callback",
    suggestion: "回扣开头的核心关键词，同时把中段最具体的场景再拿回来，让结尾既熟悉又意外。",
    generatedBit: {
      type: "CALLBACK",
      title: "结尾回扣",
      html: '所以讲到最后我才发现，开头那个问题根本没有解决。它只是换了个姿势回来，像生活特别懂脱口秀，还知道什么叫 <span class="kw">Callback</span>。',
      plainText: "所以讲到最后我才发现，开头那个问题根本没有解决。它只是换了个姿势回来，像生活特别懂脱口秀，还知道什么叫 Callback。",
      estimatedDurationSeconds: 35,
      keywords: ["回扣", "结尾"]
    }
  };
  return aiOptimizeResultSchema.parse(result);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hash(input: string) {
  return input.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}
