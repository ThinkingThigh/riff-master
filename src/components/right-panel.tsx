"use client";

import { Bot, Check, RotateCw, Send } from "lucide-react";
import { AnalysisTab } from "@/components/tabs/analysis-tab";
import { ReferenceTab } from "@/components/tabs/reference-tab";
import { WordCloudTab } from "@/components/tabs/word-cloud-tab";
import { useRiffStore } from "@/store/use-riff-store";
import type { RightPanelTab } from "@/types/riffmaster";

const tabs: Array<[RightPanelTab, string]> = [
  ["analysis", "分析"],
  ["chat", "对话"],
  ["words", "词云"],
  ["reference", "参考"]
];

export function RightPanel() {
  const tab = useRiffStore((state) => state.rightTab);
  const setTab = useRiffStore((state) => state.setRightTab);
  const aiInput = useRiffStore((state) => state.aiInput);
  const setAiInput = useRiffStore((state) => state.setAiInput);
  const sendAiMessage = useRiffStore((state) => state.sendAiMessage);

  return (
    <aside className="right-panel flex w-[300px] shrink-0 flex-col overflow-hidden border-l max-[1100px]:w-[270px]">
      <div className="flex items-center gap-2.5 border-b border-[var(--border)] p-3.5">
        <div className="relative flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple to-pink text-white">
          <Bot size={16} />
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[var(--bg-deep)] bg-teal shadow-[0_0_0_5px_rgba(62,207,176,0.08)]" />
        </div>
        <div>
          <div className="text-[13.5px] font-bold text-white">Riff AI</div>
          <div className="mt-px text-[11px] text-[var(--text-muted)]">笑点分析 · 实时优化</div>
        </div>
      </div>

      <div className="flex border-b border-[var(--border)] px-3.5">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={`border-b-2 px-2.5 py-2 text-[11.5px] transition ${tab === id ? "border-purple text-purple" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-soft)]"}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "analysis" ? <AnalysisTab /> : null}
      {tab === "chat" ? <ChatTab /> : null}
      {tab === "words" ? <WordCloudTab /> : null}
      {tab === "reference" ? <ReferenceTab /> : null}

      <div className="border-t border-[var(--border)] p-3">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus-within:border-purple focus-within:shadow-[0_0_0_3px_var(--purple-dim)]">
          <textarea
            rows={2}
            value={aiInput}
            onChange={(event) => setAiInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendAiMessage();
              }
            }}
            placeholder="问 Riff AI 任何关于这场节目的问题…"
            className="w-full resize-none border-none bg-transparent px-3 py-2 text-[12.5px] leading-normal text-white outline-none placeholder:text-[var(--text-faint)]"
          />
          <div className="flex items-center gap-1.5 px-2.5 py-1">
            <span className="flex-1 text-[10px] text-[var(--text-faint)]">Enter 发送</span>
            <button className="flex size-[26px] items-center justify-center rounded-lg bg-gradient-to-br from-purple to-pink text-white" onClick={() => void sendAiMessage()}>
              <Send size={11} />
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {["优化Punchline", "生成Callback", "哪里最弱", "开场Hook"].map((chip) => (
            <button
              key={chip}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-2 py-1 text-[10px] text-[var(--text-muted)] hover:border-gold hover:text-gold"
              onClick={() => setAiInput(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function ChatTab() {
  const show = useRiffStore((state) => state.show);
  const isAiThinking = useRiffStore((state) => state.isAiThinking);
  const sendAiMessage = useRiffStore((state) => state.sendAiMessage);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
      <SectionTitle>AI 对话</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {show.messages.map((message) => (
          <div key={message.id} className={`flex items-start gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex size-6 shrink-0 items-center justify-center rounded-md text-[9px] font-black ${message.role === "user" ? "bg-gold text-[#1A1400]" : "bg-gradient-to-br from-purple to-pink text-white"}`}>
              {message.role === "user" ? "李" : <Bot size={10} />}
            </div>
            <div>
              <div className={`max-w-[210px] rounded-[11px] px-3 py-2 text-xs leading-relaxed ${message.role === "user" ? "rounded-tr bg-gradient-to-br from-purple to-pink text-white" : "rounded-tl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-soft)]"}`}>
                {message.content}
              </div>
              {message.actions?.length ? (
                <div className="mt-1.5 flex gap-1.5">
                  {message.actions.map((action, index) => (
                    <button
                      key={action.id}
                      className={`flex items-center gap-1 rounded border px-2 py-1 text-[10px] ${index === 0 ? "border-[rgba(62,207,176,0.3)] bg-[rgba(62,207,176,0.1)] text-teal" : "border-[var(--border)] text-[var(--text-muted)] hover:border-purple hover:text-purple"}`}
                      onClick={() => void sendAiMessage(action.prompt)}
                    >
                      {index === 0 ? <Check size={10} /> : <RotateCw size={10} />}
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
        {isAiThinking ? (
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-purple to-pink text-white">
              <Bot size={10} />
            </div>
            <div className="flex gap-1 rounded-bl rounded-br-xl rounded-tr-xl border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2.5">
              <span className="size-1.5 animate-[dotbounce_1.3s_ease_infinite] rounded-full bg-[var(--text-muted)]" />
              <span className="size-1.5 animate-[dotbounce_1.3s_ease_infinite] rounded-full bg-[var(--text-muted)] [animation-delay:.18s]" />
              <span className="size-1.5 animate-[dotbounce_1.3s_ease_infinite] rounded-full bg-[var(--text-muted)] [animation-delay:.36s]" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.8px] text-[var(--text-faint)] first:mt-0">
      {children}
      <span className="h-px flex-1 bg-[var(--border)]" />
    </div>
  );
}
