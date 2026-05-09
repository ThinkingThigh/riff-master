"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import { bitTypeMeta } from "@/lib/design-system";
import { useRiffStore } from "@/store/use-riff-store";
import type { BitType } from "@/types/riffmaster";

const quickWords = [
  ["今年", "我今年——"],
  ["共情开场", "你们有没有经历过……"],
  ["转折", "所以我当时的反应是——"],
  ["联想", "这让我想到——"],
  ["加强", "最可笑的是……"],
  ["Callback", "结果呢？"]
] as const;

const tagTypes: BitType[] = ["SETUP", "PUNCHLINE", "TAGLINE", "CALLBACK"];

export function QuickInput() {
  const quickInput = useRiffStore((state) => state.quickInput);
  const setQuickInput = useRiffStore((state) => state.setQuickInput);
  const submitQuickInput = useRiffStore((state) => state.submitQuickInput);
  const expandQuickInput = useRiffStore((state) => state.expandQuickInput);
  const selectedBitType = useRiffStore((state) => state.selectedBitType);
  const setSelectedBitType = useRiffStore((state) => state.setSelectedBitType);
  const fillQuickInput = useRiffStore((state) => state.fillQuickInput);

  return (
    <div className="editor-input-wrap shrink-0 border-t px-5 py-3">
      <div className="flex items-end gap-2.5">
        <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] transition focus-within:border-purple focus-within:shadow-[0_0_0_3px_var(--purple-dim)]">
          <textarea
            value={quickInput}
            onChange={(event) => setQuickInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitQuickInput();
              }
            }}
            rows={2}
            placeholder="快速记录一个想法，或让 AI 帮你展开成完整段落…"
            className="w-full resize-none border-none bg-transparent px-3.5 pb-1.5 pt-2.5 text-[13.5px] leading-normal text-white outline-none placeholder:text-[var(--text-faint)]"
          />
          <div className="flex items-center gap-1.5 px-2.5 py-1.5">
            <div className="flex gap-1">
              {tagTypes.map((type) => (
                <button
                  key={type}
                  className={`${bitTypeMeta[type].className} rounded px-2 py-1 text-[9.5px] font-black opacity-${selectedBitType === type ? "100" : "60"}`}
                  onClick={() => setSelectedBitType(type)}
                >
                  {bitTypeMeta[type].shortLabel}
                </button>
              ))}
            </div>
            <span className="flex-1" />
            <button
              className="flex items-center gap-1 border-none bg-transparent text-[11px] text-[var(--text-muted)] hover:text-purple"
              onClick={() => void expandQuickInput()}
            >
              <Sparkles size={12} className="text-purple" />
              AI 展开
            </button>
          </div>
        </div>
        <button
          className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-purple to-pink text-white shadow-[0_3px_12px_rgba(155,109,255,0.4)] transition hover:scale-105"
          onClick={submitQuickInput}
          title="加入稿件"
        >
          <ArrowUp size={15} />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {quickWords.map(([label, value]) => (
          <button
            key={label}
            className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1 text-[10.5px] text-[var(--text-muted)] transition hover:border-gold hover:bg-[var(--gold-dim)] hover:text-gold"
            onClick={() => fillQuickInput(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
