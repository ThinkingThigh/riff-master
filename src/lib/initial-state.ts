import type { AIAnalysis, AIMessage, Bit, Material, Show } from "@/types/riffmaster";

export const initialBits: Bit[] = [];

export const initialMaterials: Material[] = [];

export const initialAnalysis: AIAnalysis = {
  averageLaughDensity: 0,
  densityBars: [],
  moodTimeline: [],
  metrics: [
    { label: "段落数", value: "0", color: "purple" },
    { label: "预计时长", value: "0分", color: "gold" },
    { label: "高峰笑点", value: "0", color: "teal" },
    { label: "笑点密度", value: "0", color: "orange" },
    { label: "完成度", value: "0%", color: "pink" },
    { label: "Callback", value: "0", color: "muted" }
  ],
  suggestions: [],
  wordCloud: [],
  repeatedWords: [],
  emotionRadar: []
};

export const initialMessages: AIMessage[] = [
  {
    id: "msg-empty",
    role: "assistant",
    content: "这是一个空白节目。输入主题后，我会按 Premise、Setup、Punchline、Tag、Callback 帮你生成和打磨。",
    actions: [
      { id: "act-zero", label: "从0生成", prompt: "帮我从一个真实经历生成一篇脱口秀初稿" },
      { id: "act-flow", label: "写作流程", prompt: "带我按脱口秀写作流程一步步创作" }
    ]
  }
];

export const initialShow: Show = {
  id: "show-empty",
  title: "未命名节目",
  status: "草稿进行中",
  category: "STAND-UP",
  topic: "",
  targetDurationMinutes: 8,
  completionRate: 0,
  bits: initialBits,
  materials: initialMaterials,
  analysis: initialAnalysis,
  messages: initialMessages
};
