"use client";

import { Bell, Film, Mic2, Sparkles, Users } from "lucide-react";
import { useRiffStore } from "@/store/use-riff-store";

export function Topbar() {
  const show = useRiffStore((state) => state.show);
  const setTitle = useRiffStore((state) => state.setTitle);
  const setRehearsalOpen = useRiffStore((state) => state.setRehearsalOpen);
  const generateCallback = useRiffStore((state) => state.generateCallback);

  return (
    <header className="topbar flex h-[52px] shrink-0 items-center border-b px-[18px]">
      <div className="flex shrink-0 items-center gap-2.5">
        <div className="flex size-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-purple to-pink text-white shadow-[0_3px_14px_rgba(155,109,255,0.5)]">
          <Mic2 size={16} />
        </div>
        <div>
          <div className="bg-gradient-to-r from-gold to-orange bg-clip-text text-[17px] font-black leading-tight tracking-[-0.3px] text-transparent">
            RiffMaster
          </div>
          <div className="mt-px text-[10px] tracking-[0.5px] text-[var(--text-muted)]">脱口秀创作系统</div>
        </div>
      </div>

      <div className="mx-4 h-[18px] w-px bg-[var(--border-bright)]" />

      <div className="topbar-title flex flex-1 items-center justify-center gap-1">
        <input
          className="w-full max-w-[360px] rounded-lg border-none bg-transparent px-3 py-1.5 text-center text-sm font-bold text-[var(--text-white)] outline-none transition focus:bg-[var(--bg-card)] hover:bg-[var(--bg-card)]"
          value={show.title}
          maxLength={80}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={(event) => setTitle(event.target.value)}
          aria-label="节目标题"
        />
        <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,77,109,0.3)] bg-[rgba(255,77,109,0.15)] px-2.5 py-1 text-[11px] font-semibold text-danger before:block before:size-[5px] before:animate-[pulse-red_1.5s_ease_infinite] before:rounded-full before:bg-danger">
          {show.status}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--bg-card)] hover:text-[var(--text-soft)]">
          <Users className="mr-1.5 inline" size={14} />
          协作
        </button>
        <button
          className="rounded-lg border border-[var(--border-bright)] px-3 py-1.5 text-xs font-semibold text-[var(--text-soft)] transition hover:border-purple hover:bg-[var(--purple-dim)] hover:text-purple"
          onClick={() => setRehearsalOpen(true)}
        >
          <Film className="mr-1.5 inline" size={14} />
          排练模式
        </button>
        <button
          className="rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-[#1A1400] shadow-[0_3px_14px_var(--gold-glow)] transition hover:-translate-y-px"
          onClick={() => void generateCallback()}
        >
          <Sparkles className="mr-1.5 inline" size={14} />
          AI 笑点优化
        </button>
        <div className="mx-1 h-[18px] w-px bg-[var(--border-bright)]" />
        <button className="rounded-lg px-2 py-1.5 text-[var(--text-muted)] transition hover:bg-[var(--bg-card)]">
          <Bell size={15} />
        </button>
        <button className="flex size-[30px] items-center justify-center rounded-full bg-gradient-to-br from-purple to-pink text-[11px] font-black text-white transition hover:ring-2 hover:ring-purple">
          李
        </button>
      </div>
    </header>
  );
}
