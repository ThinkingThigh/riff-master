"use client";

import { AlertTriangle, Lightbulb, Repeat, Target } from "lucide-react";
import { SectionTitle } from "@/components/right-panel";
import { colorDimVar, colorVar } from "@/lib/design-system";
import { useRiffStore } from "@/store/use-riff-store";

const iconMap = {
  target: Target,
  warning: AlertTriangle,
  idea: Lightbulb,
  repeat: Repeat
};

export function AnalysisTab() {
  const analysis = useRiffStore((state) => state.show.analysis);
  const setActiveBit = useRiffStore((state) => state.setActiveBit);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
      <SectionTitle>笑点密度曲线</SectionTitle>
      <div className="soft-card rounded-[10px] p-3.5">
        <div className="mb-2.5 flex items-center justify-between text-[11px]">
          <span className="text-[var(--text-muted)]">全场节奏预测</span>
          <span className="font-bold text-gold">平均 {analysis.averageLaughDensity}/10</span>
        </div>
        <div className="flex h-[50px] items-end gap-1">
          {analysis.densityBars.map((bar) => (
            <div key={bar.label} className="group relative flex-1">
              <div
                className="min-h-1 rounded-t transition-all"
                style={{
                  height: `${bar.value * 5}px`,
                  background: colorDimVar[bar.color],
                  borderTop: `2px solid ${colorVar[bar.color]}`
                }}
              />
              <div className="absolute -top-5 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[var(--bg-raised)] px-1.5 py-0.5 text-[9px] text-[var(--text-soft)] group-hover:block">
                {bar.value}/10
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 flex gap-1">
          {analysis.densityBars.map((bar) => (
            <div key={bar.label} className="flex-1 text-center text-[9px] text-[var(--text-faint)]">
              {bar.label}
            </div>
          ))}
        </div>
      </div>

      <SectionTitle>观众情绪弧线</SectionTitle>
      <div className="flex overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)]">
        {analysis.moodTimeline.map((point) => (
          <button key={point.time} className="flex-1 border-r border-[var(--border)] px-1.5 py-2.5 text-center last:border-r-0 hover:bg-[var(--bg-raised)]">
            <span className="block text-xl">{point.emoji}</span>
            <span className="mt-1 block text-[9px] text-[var(--text-faint)]">{point.time}</span>
            <span className="text-[10px] font-bold text-gold">{point.value}</span>
          </button>
        ))}
      </div>

      <SectionTitle>节目数据</SectionTitle>
      <div className="grid grid-cols-3 gap-1.5">
        {analysis.metrics.map((metric) => (
          <div key={metric.label} className="soft-card rounded-[9px] px-2 py-2.5 text-center">
            <div className="text-[19px] font-black leading-none" style={{ color: colorVar[metric.color] }}>
              {metric.value}
            </div>
            <div className="mt-1 text-[9.5px] text-[var(--text-muted)]">{metric.label}</div>
          </div>
        ))}
      </div>

      <SectionTitle>AI 建议</SectionTitle>
      <div className="flex flex-col gap-2">
        {analysis.suggestions.map((suggestion) => {
          const Icon = iconMap[suggestion.icon as keyof typeof iconMap] ?? Lightbulb;
          return (
            <button
              key={suggestion.id}
              className="soft-card flex gap-2 rounded-[9px] p-2.5 text-left hover:bg-[var(--purple-dim)]"
              onClick={() => suggestion.relatedBitId && setActiveBit(suggestion.relatedBitId)}
            >
              <Icon className="mt-0.5 shrink-0 text-purple" size={16} />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-white">{suggestion.title}</span>
                <span className="mt-0.5 block text-[11px] leading-normal text-[var(--text-muted)]">{suggestion.description}</span>
              </span>
              <span className="rounded px-1.5 py-0.5 text-[9px] font-bold text-gold" style={{ background: "rgba(245,200,66,0.12)" }}>
                {suggestion.priority}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
