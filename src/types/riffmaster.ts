export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type RightPanelTab = "analysis" | "chat" | "words" | "reference";

export type BitType =
  | "SETUP"
  | "PUNCHLINE"
  | "TAGLINE"
  | "CALLBACK"
  | "OBSERVATIONAL"
  | "SELF_DEPRECATION";

export type ReactionType = "laugh" | "smile" | "flat";

export type MaterialType = "BIT" | "QUOTE" | "TOPIC" | "INSPIRATION";

export type RehearsalMode = "solo" | "friends" | "recording" | "ai-audience";

export interface ReactionCounts {
  laugh: number;
  smile: number;
  flat: number;
}

export interface Bit {
  id: string;
  order: number;
  type: BitType;
  title: string;
  html: string;
  plainText: string;
  expectedLaughPercent: number | null;
  estimatedDurationSeconds: number;
  reactions: ReactionCounts;
  keywords: string[];
}

export interface Material {
  id: string;
  title: string;
  content: string;
  type: MaterialType;
  group: "当前节目" | "话题池" | "灵感记录";
  meta: string;
  badge?: string;
  isMain?: boolean;
  isHot?: boolean;
  isNew?: boolean;
  icon: string;
  color: "purple" | "gold" | "teal" | "pink" | "orange" | "red";
}

export interface DensityBar {
  label: string;
  value: number;
  color: "purple" | "gold" | "teal" | "pink" | "orange";
}

export interface MoodPoint {
  time: string;
  emoji: string;
  value: number;
}

export interface Metric {
  label: string;
  value: string;
  color: "purple" | "gold" | "teal" | "pink" | "orange" | "muted";
}

export interface AISuggestion {
  id: string;
  type: "strength" | "optimize" | "idea" | "callback";
  priority: "高优" | "优化" | "建议" | "亮点";
  title: string;
  description: string;
  icon: string;
  relatedBitId?: string;
}

export interface WordCloudItem {
  word: string;
  weight: number;
  color: "purple" | "gold" | "teal" | "pink" | "orange" | "red";
}

export interface RepeatedWord {
  word: string;
  count: number;
  severity: "warning" | "notice" | "ok";
  percent: number;
}

export interface EmotionRadarPoint {
  label: string;
  value: number;
}

export interface AIAnalysis {
  averageLaughDensity: number;
  densityBars: DensityBar[];
  moodTimeline: MoodPoint[];
  metrics: Metric[];
  suggestions: AISuggestion[];
  wordCloud: WordCloudItem[];
  repeatedWords: RepeatedWord[];
  emotionRadar: EmotionRadarPoint[];
}

export interface AIMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
  actions?: Array<{
    id: string;
    label: string;
    prompt: string;
  }>;
}

export interface Show {
  id: string;
  title: string;
  status: "草稿进行中" | "AI 分析中" | "待排练" | "排练中" | "已完成" | "已归档";
  category: string;
  topic: string;
  targetDurationMinutes: number;
  completionRate: number;
  bits: Bit[];
  materials: Material[];
  analysis: AIAnalysis;
  messages: AIMessage[];
}

export interface AIOptimizeResult {
  title: string;
  suggestion: string;
  generatedBit?: Pick<Bit, "type" | "title" | "html" | "plainText" | "estimatedDurationSeconds" | "keywords">;
}
