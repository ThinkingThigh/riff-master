"use client";

import { SectionTitle } from "@/components/right-panel";
import { colorDimVar, colorVar } from "@/lib/design-system";
import { useRiffStore } from "@/store/use-riff-store";

export function WordCloudTab() {
  const analysis = useRiffStore((state) => state.show.analysis);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
      <SectionTitle>核心词汇</SectionTitle>
      <div className="soft-card flex flex-wrap gap-1.5 rounded-[10px] p-3">
        {analysis.wordCloud.map((item) => (
          <button
            key={item.word}
            className="rounded-full px-2.5 py-1 font-semibold transition hover:scale-105"
            style={{
              color: colorVar[item.color],
              background: colorDimVar[item.color],
              fontSize: `${item.weight}px`
            }}
          >
            {item.word}
          </button>
        ))}
      </div>

      <SectionTitle>情感频率分析</SectionTitle>
      <div className="soft-card rounded-[10px] p-3">
        <div className="grid grid-cols-2 gap-2">
          {analysis.emotionRadar.map((point) => (
            <div key={point.label} className="flex items-center gap-2">
              <span className="w-9 text-[10px] text-[var(--text-muted)]">{point.label}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded bg-[var(--bg-raised)]">
                <span className="block h-full rounded bg-purple" style={{ width: `${point.value * 10}%` }} />
              </span>
              <span className="w-4 text-right text-[10px] font-bold text-purple">{point.value}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>重复词频警告</SectionTitle>
      <div className="flex flex-col gap-1.5">
        {analysis.repeatedWords.map((item) => {
          const color = item.severity === "warning" ? "var(--red)" : item.severity === "notice" ? "var(--orange)" : "var(--teal)";
          return (
            <div key={item.word} className="soft-card flex items-center gap-2 rounded-lg px-2.5 py-2">
              <span className="flex-1 text-xs text-[var(--text-soft)]">「{item.word}」</span>
              <span className="h-1 w-20 overflow-hidden rounded bg-[var(--bg-raised)]">
                <span className="block h-full rounded" style={{ width: `${item.percent}%`, background: color }} />
              </span>
              <span className="text-[11px] font-bold" style={{ color }}>
                {item.count}次
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
