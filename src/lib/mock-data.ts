import type { AIAnalysis, AIMessage, Bit, Material, Show } from "@/types/riffmaster";

export const initialBits: Bit[] = [
  {
    id: "bit-1",
    order: 1,
    type: "SETUP",
    title: "开场铺垫",
    html: '我在北京待了<span class="kw">整整十年</span>。你们知道北京十年意味着什么吗？意味着我<span class="kw-purple">掌握了一项核心技能</span>——我能精准判断，一条路，我走还是不走——<strong>全看导航上那个小红点是静止的，还是在轻微地颤抖。</strong>',
    plainText: "我在北京待了整整十年。你们知道北京十年意味着什么吗？意味着我掌握了一项核心技能——我能精准判断，一条路，我走还是不走——全看导航上那个小红点是静止的，还是在轻微地颤抖。",
    expectedLaughPercent: 62,
    estimatedDurationSeconds: 45,
    reactions: { laugh: 12, smile: 5, flat: 1 },
    keywords: ["十年", "导航", "红点"]
  },
  {
    id: "bit-2",
    order: 2,
    type: "PUNCHLINE",
    title: "核心笑点",
    html: '但我最近决定离开北京。我妈听说之后，<span class="kw-pink">震惊</span>地问我：儿子，你是不是被北京的什么人欺负了？我说，妈，没有，北京对我挺好的——它只是<span class="kw">收了我十年房租</span>，然后很客气地告诉我，<strong>我永远是这座城市的游客。</strong>',
    plainText: "但我最近决定离开北京。我妈听说之后，震惊地问我：儿子，你是不是被北京的什么人欺负了？我说，妈，没有，北京对我挺好的——它只是收了我十年房租，然后很客气地告诉我，我永远是这座城市的游客。",
    expectedLaughPercent: 91,
    estimatedDurationSeconds: 50,
    reactions: { laugh: 28, smile: 3, flat: 0 },
    keywords: ["房租", "游客"]
  },
  {
    id: "bit-3",
    order: 3,
    type: "OBSERVATIONAL",
    title: "生活素材",
    html: '北京人对方向感的执着，是外地人永远理解不了的。我在北京第一年，跟一个老北京问路，他跟我说：<span class="kw">出门往东，再往南，看见那棵歪脖子树，那儿以前有个邮局</span>——我跟他说，大哥，现在是2015年，邮局已经是一个抽象概念了。',
    plainText: "北京人对方向感的执着，是外地人永远理解不了的。我在北京第一年，跟一个老北京问路，他跟我说：出门往东，再往南，看见那棵歪脖子树，那儿以前有个邮局——我跟他说，大哥，现在是2015年，邮局已经是一个抽象概念了。",
    expectedLaughPercent: 76,
    estimatedDurationSeconds: 55,
    reactions: { laugh: 19, smile: 8, flat: 2 },
    keywords: ["方向", "歪脖子树", "邮局"]
  },
  {
    id: "bit-4",
    order: 4,
    type: "TAGLINE",
    title: "补充笑点",
    html: '他顿了顿，补充了一句：<span class="kw">"那棵歪脖子树还在的。"</span>',
    plainText: '他顿了顿，补充了一句："那棵歪脖子树还在的。"',
    expectedLaughPercent: 84,
    estimatedDurationSeconds: 10,
    reactions: { laugh: 35, smile: 2, flat: 0 },
    keywords: ["歪脖子树"]
  },
  {
    id: "bit-5",
    order: 5,
    type: "CALLBACK",
    title: "回扣笑点",
    html: '所以现在我要走了，我去跟房东辞行。房东很感动，拉着我的手说：小李啊，你是我们小区<span class="kw">租金最准时</span>的租客，<span class="kw-purple">走了真可惜</span>。我当时眼眶都湿了——我以为他说的是我这个人。',
    plainText: "所以现在我要走了，我去跟房东辞行。房东很感动，拉着我的手说：小李啊，你是我们小区租金最准时的租客，走了真可惜。我当时眼眶都湿了——我以为他说的是我这个人。",
    expectedLaughPercent: 88,
    estimatedDurationSeconds: 40,
    reactions: { laugh: 0, smile: 0, flat: 0 },
    keywords: ["房东", "租金"]
  }
];

export const initialMaterials: Material[] = [
  { id: "mat-1", title: "北漂十年感悟", content: "主稿素材", type: "BIT", group: "当前节目", meta: "12段 · ★ 热门", badge: "主稿", isMain: true, isHot: true, icon: "microphone", color: "purple" },
  { id: "mat-2", title: "租房奇葩经历", content: "备用素材", type: "BIT", group: "当前节目", meta: "5段 · 备用素材", icon: "lightbulb", color: "gold" },
  { id: "mat-3", title: "地铁上的人类", content: "观察喜剧", type: "BIT", group: "当前节目", meta: "8段 · 观察喜剧", icon: "train", color: "teal" },
  { id: "mat-4", title: "相亲那些事", content: "关系类", type: "TOPIC", group: "话题池", meta: "3段 · 关系类", badge: "新", isNew: true, icon: "heart", color: "pink" },
  { id: "mat-5", title: "职场黑话大赏", content: "职场类", type: "TOPIC", group: "话题池", meta: "11段 · 职场类", icon: "briefcase", color: "orange" },
  { id: "mat-6", title: "互联网黑话", content: "科技类", type: "TOPIC", group: "话题池", meta: "7段 · 科技类", icon: "phone", color: "teal" },
  { id: "mat-7", title: "外卖人生哲学", content: "生活观察", type: "TOPIC", group: "话题池", meta: "4段 · 生活观察", icon: "bowl", color: "gold" },
  { id: "mat-8", title: "地铁广告词槽点", content: "随手记", type: "INSPIRATION", group: "灵感记录", meta: "随手记 · 2分钟前", icon: "bolt", color: "red" },
  { id: "mat-9", title: "老板当众表扬", content: "随手记", type: "INSPIRATION", group: "灵感记录", meta: "随手记 · 昨天", icon: "bolt", color: "purple" }
];

export const initialAnalysis: AIAnalysis = {
  averageLaughDensity: 8.4,
  densityBars: [
    { label: "开场", value: 6, color: "purple" },
    { label: "Bit1", value: 8, color: "teal" },
    { label: "Bit2", value: 9, color: "orange" },
    { label: "Bit3", value: 7, color: "purple" },
    { label: "Bit4", value: 10, color: "gold" },
    { label: "过渡", value: 5, color: "pink" },
    { label: "Bit5", value: 9, color: "teal" },
    { label: "结尾", value: 8, color: "gold" }
  ],
  moodTimeline: [
    { emoji: "😐", time: "0-2min", value: 65 },
    { emoji: "😄", time: "2-5min", value: 78 },
    { emoji: "😂", time: "5-9min", value: 92 },
    { emoji: "🤣", time: "9-14min", value: 97 },
    { emoji: "😄", time: "14min+", value: 82 }
  ],
  metrics: [
    { label: "段落数", value: "5", color: "purple" },
    { label: "预计时长", value: "18分", color: "gold" },
    { label: "高峰笑点", value: "3", color: "teal" },
    { label: "笑点密度", value: "8.4", color: "orange" },
    { label: "完成度", value: "62%", color: "pink" },
    { label: "Callback", value: "2", color: "muted" }
  ],
  suggestions: [
    { id: "sug-1", type: "strength", priority: "高优", icon: "target", title: "第4段是本场最强笑点", description: "「那棵歪脖子树还在」这类意外转折往往在现场效果最佳，建议前后给足停顿。", relatedBitId: "bit-4" },
    { id: "sug-2", type: "optimize", priority: "优化", icon: "warning", title: "第3段节奏偏慢", description: "铺垫长度超过预估 30%，建议压缩问路的情境描述，直接进入邮局这个转折点。", relatedBitId: "bit-3" },
    { id: "sug-3", type: "idea", priority: "建议", icon: "idea", title: "缺少开场 Hook", description: "建议在第1段前加一句强力 Hook，先把观众情绪调动起来再铺垫。", relatedBitId: "bit-1" },
    { id: "sug-4", type: "callback", priority: "亮点", icon: "repeat", title: "Callback 机会", description: "「游客」和「歪脖子树」均适合在结尾做双重 Callback，可以形成完整闭环。", relatedBitId: "bit-5" }
  ],
  wordCloud: [
    { word: "北京", weight: 16, color: "purple" },
    { word: "十年", weight: 20, color: "gold" },
    { word: "游客", weight: 13, color: "pink" },
    { word: "房租", weight: 14, color: "teal" },
    { word: "歪脖子树", weight: 18, color: "orange" },
    { word: "导航", weight: 12, color: "purple" },
    { word: "邮局", weight: 13, color: "gold" },
    { word: "房东", weight: 15, color: "red" },
    { word: "北漂", weight: 11, color: "teal" },
    { word: "租金", weight: 17, color: "pink" }
  ],
  repeatedWords: [
    { word: "北京", count: 9, severity: "warning", percent: 90 },
    { word: "我", count: 14, severity: "notice", percent: 70 },
    { word: "十年", count: 4, severity: "ok", percent: 40 }
  ],
  emotionRadar: [
    { label: "自嘲", value: 7 },
    { label: "观察", value: 9 },
    { label: "共情", value: 8 },
    { label: "转折", value: 6 },
    { label: "荒诞", value: 5 },
    { label: "温情", value: 4 }
  ]
};

export const initialMessages: AIMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content: "你好！我已分析全部5段内容。整体风格偏「北漂情感共鸣」，笑点类型以 Observational + Tagline 为主，建议在中段增加一个自嘲型的 Bit 来制造情感对比，需要我生成示例吗？",
    actions: [
      { id: "act-1", label: "生成示例", prompt: "帮我生成一段自嘲型 Bit，主题关于第一次在北京面试" },
      { id: "act-2", label: "重新分析", prompt: "请从观众角度重新分析整个节目的弱点" }
    ]
  }
];

export const initialShow: Show = {
  id: "show-1",
  title: "北漂十年：你好，北京，我要走了",
  status: "草稿进行中",
  category: "STAND-UP",
  topic: "个人经历",
  targetDurationMinutes: 18,
  completionRate: 62,
  bits: initialBits,
  materials: initialMaterials,
  analysis: initialAnalysis,
  messages: initialMessages
};
