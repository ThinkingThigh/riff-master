import { aiOptimizeResultSchema } from "@/lib/contracts";
import type { AIMessage, AIOptimizeResult, Bit, Show } from "@/types/riffmaster";

const replies = [
  "好问题！这部分的关键在于 Rule of Three：前两个细节建立规律，第三个细节突然打破观众预期。建议把最荒诞的词放在句尾。",
  "我注意到「北京」和「游客」形成了很好的身份对照。结尾再次呼应游客，可以让整场从生活观察收束到情绪表达。",
  "从目前结构看，第3、4段连续偏观察类，中间可以插入一个更私人化的自嘲段落，让观众从看热闹切换到共情。"
];

export async function mockChatWithContext(message: string): Promise<AIMessage> {
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

export async function mockOptimizeBit(bit: Bit, show: Show): Promise<AIOptimizeResult> {
  await delay(700);
  const result: AIOptimizeResult = {
    title: `优化 ${bit.title}`,
    suggestion: `建议保留「${bit.keywords[0] ?? show.topic}」作为锚点，把铺垫压缩 20%，并把反转词放到句尾。`,
    generatedBit: {
      type: bit.type,
      title: `${bit.title} · AI 改写`,
      html: `${bit.plainText} <strong>但真正可怕的是，我以为自己在选择城市，其实城市一直在选择我的房租。</strong>`,
      plainText: `${bit.plainText} 但真正可怕的是，我以为自己在选择城市，其实城市一直在选择我的房租。`,
      estimatedDurationSeconds: Math.max(20, bit.estimatedDurationSeconds),
      keywords: [...new Set([...bit.keywords, "房租", "反转"])]
    }
  };
  return aiOptimizeResultSchema.parse(result);
}

export async function mockGenerateCallback(): Promise<AIOptimizeResult> {
  await delay(700);
  const result: AIOptimizeResult = {
    title: "生成 Callback",
    suggestion: "用「游客」回扣开头身份，用「歪脖子树」回扣中段场景，形成双重闭环。",
    generatedBit: {
      type: "CALLBACK",
      title: "游客回扣",
      html: '后来我才明白，北京不是不留我。北京只是很认真地给我办了一张<span class="kw">十年游客年卡</span>。唯一的会员权益是：每次迷路，都能看到那棵歪脖子树还在。',
      plainText: "后来我才明白，北京不是不留我。北京只是很认真地给我办了一张十年游客年卡。唯一的会员权益是：每次迷路，都能看到那棵歪脖子树还在。",
      estimatedDurationSeconds: 35,
      keywords: ["游客", "歪脖子树", "回扣"]
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
