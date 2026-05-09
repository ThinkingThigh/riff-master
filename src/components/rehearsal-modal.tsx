"use client";

import { Bot, Play, UserCheck, Users, Video, X } from "lucide-react";
import { useRiffStore } from "@/store/use-riff-store";
import type { RehearsalMode } from "@/types/riffmaster";

const modes: Array<{ id: RehearsalMode; title: string; desc: string; icon: typeof Bot; color: string }> = [
  { id: "solo", title: "独自排练", desc: "自我提词 + 计时", icon: UserCheck, color: "var(--purple)" },
  { id: "friends", title: "小圈子试演", desc: "邀请朋友实时评分", icon: Users, color: "var(--gold)" },
  { id: "recording", title: "录像回放", desc: "录音 + AI 节奏分析", icon: Video, color: "var(--pink)" },
  { id: "ai-audience", title: "AI 观众模拟", desc: "虚拟观众实时反应", icon: Bot, color: "var(--teal)" }
];

export function RehearsalModal() {
  const open = useRiffStore((state) => state.isRehearsalOpen);
  const selected = useRiffStore((state) => state.selectedRehearsalMode);
  const setOpen = useRiffStore((state) => state.setRehearsalOpen);
  const setMode = useRiffStore((state) => state.setRehearsalMode);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <div className="relative w-[92%] max-w-[500px] rounded-[20px] border border-[var(--border-bright)] bg-[var(--bg-card)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <button className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text-muted)] hover:text-white" onClick={() => setOpen(false)}>
          <X size={13} />
        </button>
        <div className="font-serif text-xl font-black text-white">进入排练模式</div>
        <div className="mb-5 mt-1 text-[13px] text-[var(--text-muted)]">选择排练参数，模拟真实演出环境</div>
        <div className="mb-5 grid grid-cols-2 gap-2.5">
          {modes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                className="rounded-xl border-2 bg-[var(--bg-raised)] p-4 text-center transition"
                style={{ borderColor: selected === mode.id ? mode.color : "var(--border-bright)" }}
                onClick={() => setMode(mode.id)}
              >
                <Icon className="mx-auto mb-2" size={24} style={{ color: mode.color }} />
                <div className="text-[13px] font-bold text-white">{mode.title}</div>
                <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{mode.desc}</div>
              </button>
            );
          })}
        </div>
        <button className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-purple py-3 text-sm font-bold text-white shadow-[0_3px_14px_var(--purple-glow)]" onClick={() => setOpen(false)}>
          <Play size={14} />
          开始排练
        </button>
      </div>
    </div>
  );
}
