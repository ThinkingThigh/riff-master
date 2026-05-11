"use client";

import { create } from "zustand";
import { localChatWithContext, localGenerateCallback, localOptimizeBit } from "@/lib/ai";
import { initialShow } from "@/lib/initial-state";
import { safeId, stripHtml } from "@/lib/utils";
import type {
  AIMessage,
  Bit,
  BitType,
  Material,
  ReactionType,
  RehearsalMode,
  RightPanelTab,
  SaveStatus,
  Show
} from "@/types/riffmaster";

const STORAGE_KEY = "riffmaster:mvp-show";

interface RiffState {
  show: Show;
  activeBitId: string | null;
  selectedBitType: BitType;
  rightTab: RightPanelTab;
  selectedMaterialTab: "全部" | "段子" | "金句" | "话题";
  materialSearch: string;
  quickInput: string;
  aiInput: string;
  isAiThinking: boolean;
  saveStatus: SaveStatus;
  isRehearsalOpen: boolean;
  selectedRehearsalMode: RehearsalMode | null;
  toast: string | null;
  hydrate: () => void;
  setTitle: (title: string) => void;
  setActiveBit: (id: string) => void;
  setSelectedBitType: (type: BitType) => void;
  updateBitContent: (id: string, html: string) => void;
  addBit: (content?: string, type?: BitType) => void;
  insertGeneratedBit: (bit: Omit<Bit, "id" | "order" | "expectedLaughPercent" | "reactions">) => void;
  copyBit: (id: string) => void;
  deleteBit: (id: string) => void;
  reactToBit: (id: string, reaction: ReactionType) => void;
  setRightTab: (tab: RightPanelTab) => void;
  setMaterialTab: (tab: RiffState["selectedMaterialTab"]) => void;
  setMaterialSearch: (query: string) => void;
  addMaterial: (title: string) => void;
  setQuickInput: (value: string) => void;
  fillQuickInput: (value: string) => void;
  submitQuickInput: () => void;
  expandQuickInput: () => Promise<void>;
  setAiInput: (value: string) => void;
  sendAiMessage: (message?: string) => Promise<void>;
  optimizeBit: (id: string) => Promise<void>;
  generateCallback: () => Promise<void>;
  setRehearsalOpen: (open: boolean) => void;
  setRehearsalMode: (mode: RehearsalMode) => void;
  markSaved: () => void;
  dismissToast: () => void;
}

type RiffSet = (partial: Partial<RiffState> | ((state: RiffState) => Partial<RiffState>)) => void;

export const useRiffStore = create<RiffState>((set, get) => ({
  show: initialShow,
  activeBitId: null,
  selectedBitType: "SETUP",
  rightTab: "analysis",
  selectedMaterialTab: "全部",
  materialSearch: "",
  quickInput: "",
  aiInput: "",
  isAiThinking: false,
  saveStatus: "saved",
  isRehearsalOpen: false,
  selectedRehearsalMode: null,
  toast: null,
  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Show;
      set({ show: parsed, saveStatus: "saved", activeBitId: parsed.bits[0]?.id ?? null });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  },
  setTitle: (title) => {
    updateShow({ title: title.trim() || "未命名节目" }, set, get);
  },
  setActiveBit: (id) => set({ activeBitId: id }),
  setSelectedBitType: (type) => set({ selectedBitType: type }),
  updateBitContent: (id, html) => {
    const plainText = stripHtml(html);
    updateBits(
      (bits) =>
        bits.map((bit) =>
          bit.id === id
            ? {
                ...bit,
                html,
                plainText,
                estimatedDurationSeconds: estimateDuration(plainText)
              }
            : bit
        ),
      set,
      get
    );
  },
  addBit: (content, type) => {
    const selected = type ?? get().selectedBitType;
    const plainText = content?.trim() ?? "";
    const newBit: Bit = {
      id: safeId("bit"),
      order: get().show.bits.length + 1,
      type: selected,
      title: titleForType(selected),
      html: plainText,
      plainText,
      expectedLaughPercent: null,
      estimatedDurationSeconds: estimateDuration(plainText),
      reactions: { laugh: 0, smile: 0, flat: 0 },
      keywords: []
    };
    updateBits((bits) => [...bits, newBit], set, get);
    set({ activeBitId: newBit.id, quickInput: "", toast: "已添加新段落" });
  },
  insertGeneratedBit: (generated) => {
    const newBit: Bit = {
      ...generated,
      id: safeId("bit"),
      order: get().show.bits.length + 1,
      expectedLaughPercent: null,
      reactions: { laugh: 0, smile: 0, flat: 0 }
    };
    updateBits((bits) => [...bits, newBit], set, get);
    set({ activeBitId: newBit.id, toast: "AI 生成段落已插入" });
  },
  copyBit: (id) => {
    const source = get().show.bits.find((bit) => bit.id === id);
    if (!source) return;
    const copy: Bit = {
      ...source,
      id: safeId("bit"),
      title: `${source.title} 副本`,
      order: source.order + 1,
      reactions: { laugh: 0, smile: 0, flat: 0 }
    };
    updateBits(
      (bits) => {
        const index = bits.findIndex((bit) => bit.id === id);
        const next = [...bits.slice(0, index + 1), copy, ...bits.slice(index + 1)];
        return renumber(next);
      },
      set,
      get
    );
    set({ activeBitId: copy.id, toast: "已复制段落" });
  },
  deleteBit: (id) => {
    if (get().show.bits.length <= 1) {
      set({ toast: "至少保留一个段落" });
      return;
    }
    updateBits((bits) => renumber(bits.filter((bit) => bit.id !== id)), set, get);
    set((state) => ({ activeBitId: state.show.bits[0]?.id ?? null, toast: "已删除段落" }));
  },
  reactToBit: (id, reaction) => {
    updateBits(
      (bits) =>
        bits.map((bit) =>
          bit.id === id
            ? {
                ...bit,
                reactions: {
                  ...bit.reactions,
                  [reaction]: bit.reactions[reaction] + 1
                }
              }
            : bit
        ),
      set,
      get
    );
  },
  setRightTab: (tab) => set({ rightTab: tab }),
  setMaterialTab: (tab) => set({ selectedMaterialTab: tab }),
  setMaterialSearch: (query) => set({ materialSearch: query }),
  addMaterial: (title) => {
    const value = title.trim();
    if (!value) return;
    const material: Material = {
      id: safeId("mat"),
      title: value,
      content: value,
      type: "INSPIRATION",
      group: "灵感记录",
      meta: "随手记 · 刚刚",
      badge: "新",
      isNew: true,
      icon: "bolt",
      color: "purple"
    };
    updateShow({ materials: [material, ...get().show.materials] }, set, get);
    set({ toast: "已记录新灵感" });
  },
  setQuickInput: (value) => set({ quickInput: value }),
  fillQuickInput: (value) => set({ quickInput: value }),
  submitQuickInput: () => {
    const value = get().quickInput.trim();
    if (!value) return;
    get().addBit(value);
  },
  expandQuickInput: async () => {
    const value = get().quickInput.trim();
    if (!value) return;
    await get().sendAiMessage(`请将以下想法展开成完整段落：${value}`);
  },
  setAiInput: (value) => set({ aiInput: value }),
  sendAiMessage: async (message) => {
    const value = (message ?? get().aiInput).trim();
    if (!value) return;
    const userMessage: AIMessage = { id: safeId("msg"), role: "user", content: value };
    set((state) => ({
      show: { ...state.show, messages: [...state.show.messages, userMessage] },
      aiInput: "",
      rightTab: "chat",
      isAiThinking: true
    }));
    const reply = await localChatWithContext(value);
    set((state) => ({
      show: { ...state.show, messages: [...state.show.messages, reply] },
      isAiThinking: false
    }));
  },
  optimizeBit: async (id) => {
    const bit = get().show.bits.find((item) => item.id === id);
    if (!bit) return;
    set({ rightTab: "chat", isAiThinking: true });
    const result = await localOptimizeBit(bit, get().show);
    const message: AIMessage = {
      id: safeId("msg"),
      role: "assistant",
      content: `${result.title}：${result.suggestion}`,
      actions: result.generatedBit
        ? [{ id: safeId("action"), label: "插入为新 Bit", prompt: "__insert_latest_generated_bit__" }]
        : undefined
    };
    set((state) => ({
      show: { ...state.show, messages: [...state.show.messages, message] },
      isAiThinking: false
    }));
    if (result.generatedBit) get().insertGeneratedBit(result.generatedBit);
  },
  generateCallback: async () => {
    set({ rightTab: "chat", isAiThinking: true });
    const result = await localGenerateCallback();
    const message: AIMessage = {
      id: safeId("msg"),
      role: "assistant",
      content: `${result.title}：${result.suggestion}`
    };
    set((state) => ({
      show: { ...state.show, messages: [...state.show.messages, message] },
      isAiThinking: false
    }));
    if (result.generatedBit) get().insertGeneratedBit(result.generatedBit);
  },
  setRehearsalOpen: (open) => set({ isRehearsalOpen: open }),
  setRehearsalMode: (mode) => set({ selectedRehearsalMode: mode }),
  markSaved: () => {
    persist(get().show);
    set({ saveStatus: "saved" });
  },
  dismissToast: () => set({ toast: null })
}));

function updateShow(
  patch: Partial<Show>,
  set: RiffSet,
  get: typeof useRiffStore.getState
) {
  const next = { ...get().show, ...patch };
  set({ show: next, saveStatus: "saving" });
  schedulePersist(next, set);
}

function updateBits(
  updater: (bits: Bit[]) => Bit[],
  set: RiffSet,
  get: typeof useRiffStore.getState
) {
  const bits = updater(get().show.bits);
  const completionRate = calculateCompletion(bits);
  const callbackCount = bits.filter((bit) => bit.type === "CALLBACK").length;
  updateShow({ bits, completionRate, analysis: updateMetrics(get().show.analysis, bits, completionRate, callbackCount) }, set, get);
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(show: Show, set: RiffSet) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      persist(show);
      set({ saveStatus: "saved" });
    } catch {
      set({ saveStatus: "error" });
    }
  }, 700);
}

function persist(show: Show) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(show));
}

function renumber(bits: Bit[]) {
  return bits.map((bit, index) => ({ ...bit, order: index + 1 }));
}

function titleForType(type: BitType) {
  const titles: Record<BitType, string> = {
    SETUP: "铺垫段落",
    PUNCHLINE: "核心笑点",
    TAGLINE: "补充笑点",
    CALLBACK: "回扣笑点",
    OBSERVATIONAL: "生活素材",
    SELF_DEPRECATION: "自嘲段落"
  };
  return titles[type];
}

function estimateDuration(text: string) {
  if (!text) return 0;
  return Math.max(10, Math.round(text.length / 4));
}

function calculateCompletion(bits: Bit[]) {
  const filled = bits.filter((bit) => bit.plainText.length > 12).length;
  return Math.min(100, Math.round((filled / Math.max(bits.length, 1)) * 70 + Math.min(bits.length, 8) * 4));
}

function updateMetrics(analysis: Show["analysis"], bits: Bit[], completionRate: number, callbackCount: number) {
  const avg = bits.reduce((sum, bit) => sum + (bit.expectedLaughPercent ?? 50), 0) / Math.max(bits.length, 1) / 10;
  return {
    ...analysis,
    averageLaughDensity: Number(avg.toFixed(1)),
    metrics: [
      { label: "段落数", value: String(bits.length), color: "purple" as const },
      { label: "预计时长", value: "18分", color: "gold" as const },
      { label: "高峰笑点", value: String(bits.filter((bit) => (bit.expectedLaughPercent ?? 0) >= 85).length), color: "teal" as const },
      { label: "笑点密度", value: avg.toFixed(1), color: "orange" as const },
      { label: "完成度", value: `${completionRate}%`, color: "pink" as const },
      { label: "Callback", value: String(callbackCount), color: "muted" as const }
    ]
  };
}
