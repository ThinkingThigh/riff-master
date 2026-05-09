"use client";

import { Bold, Clapperboard, Copy, Eye, Highlighter, Italic, Maximize, MessageSquare, Music, Pause, RotateCcw, RotateCw, StepForward, WandSparkles } from "lucide-react";
import { BitCard } from "@/components/bit-card";
import { QuickInput } from "@/components/quick-input";
import { bitTypeMeta } from "@/lib/design-system";
import { useRiffStore } from "@/store/use-riff-store";
import type { BitType } from "@/types/riffmaster";

const typeOptions: BitType[] = ["SETUP", "PUNCHLINE", "TAGLINE", "CALLBACK", "OBSERVATIONAL", "SELF_DEPRECATION"];

export function EditorMain() {
  const show = useRiffStore((state) => state.show);
  const selectedBitType = useRiffStore((state) => state.selectedBitType);
  const setSelectedBitType = useRiffStore((state) => state.setSelectedBitType);
  const addBit = useRiffStore((state) => state.addBit);

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--bg-void)]">
      <div className="editor-toolbar flex h-11 shrink-0 items-center gap-0.5 border-b px-4">
        <select
          value={selectedBitType}
          onChange={(event) => setSelectedBitType(event.target.value as BitType)}
          className="h-6 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2 text-[11.5px] text-[var(--text-soft)] outline-none"
        >
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {bitTypeMeta[type].label}
            </option>
          ))}
        </select>
        <ToolbarButton active icon={Bold} title="加粗" />
        <ToolbarButton icon={Italic} title="斜体" />
        <ToolbarButton icon={Highlighter} title="高亮笑点" />
        <Sep />
        <ToolbarButton icon={Pause} title="插入停顿标记" />
        <ToolbarButton icon={StepForward} title="插入强调" />
        <ToolbarButton icon={MessageSquare} title="添加注释" />
        <Sep />
        <ToolbarButton icon={Clapperboard} title="舞台方向" />
        <ToolbarButton icon={Music} title="插入音效标记" />
        <ToolbarButton icon={Copy} title="克隆段落" />
        <Sep />
        <ToolbarButton icon={RotateCcw} title="撤销" />
        <ToolbarButton icon={RotateCw} title="重做" />

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1">
            <span className="text-gold">☻</span>
            <span className="text-[11px] text-[var(--text-muted)]">笑点密度</span>
            <span className="text-[13px] font-bold text-gold">{show.analysis.averageLaughDensity}</span>
            <span className="text-[10px] text-[var(--text-muted)]">/10</span>
          </div>
          <Sep />
          <ToolbarButton icon={Maximize} title="专注模式" />
          <ToolbarButton icon={Eye} title="预览稿件" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto min-h-full max-w-[780px] px-[60px] pb-[100px] pt-10 max-[720px]:px-7 max-[720px]:pt-8">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="rounded-full border border-[rgba(245,200,66,0.3)] bg-[var(--gold-dim)] px-3 py-1 text-[10px] font-black uppercase tracking-[1.2px] text-gold">
              STAND-UP · {show.topic}
            </span>
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-[11px] text-[var(--text-faint)]">时长预计 {show.targetDurationMinutes} 分钟</span>
          </div>

          {show.bits.map((bit) => (
            <BitCard key={bit.id} bit={bit} />
          ))}

          <button
            className="my-6 flex w-full items-center gap-2 text-[var(--text-muted)]"
            onClick={() => addBit()}
          >
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--text-faint)] px-3.5 py-2 text-xs transition hover:border-purple hover:bg-[var(--purple-dim)] hover:text-purple">
              <WandSparkles size={13} />
              添加新段落
            </span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </button>
        </div>
      </div>

      <QuickInput />
    </main>
  );
}

function ToolbarButton({ icon: Icon, title, active }: { icon: typeof Bold; title: string; active?: boolean }) {
  return (
    <button
      title={title}
      className={`flex size-[30px] items-center justify-center rounded-md text-[var(--text-muted)] transition hover:bg-[var(--bg-card)] hover:text-[var(--text-soft)] ${
        active ? "bg-[var(--purple-dim)] text-purple" : ""
      }`}
    >
      <Icon size={13} />
    </button>
  );
}

function Sep() {
  return <span className="mx-1.5 h-[18px] w-px bg-[var(--border)]" />;
}
