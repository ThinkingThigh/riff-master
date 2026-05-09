"use client";

import { Box, ChartLine, CircleDot, Clock3, Cog, Mic, Network, PenLine } from "lucide-react";

const navItems = [
  { title: "编辑器", icon: PenLine, active: true },
  { title: "素材库", icon: Box, badge: true },
  { title: "主题地图", icon: Network },
  { title: "笑点分析", icon: ChartLine, separated: true },
  { title: "历史版本", icon: Clock3 },
  { title: "录音稿", icon: CircleDot }
];

export function IconRail() {
  return (
    <nav className="icon-rail flex w-[54px] shrink-0 flex-col items-center gap-1 border-r py-2.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="contents">
            {item.separated ? <div className="my-1 h-px w-6 bg-[var(--border)]" /> : null}
            <button
              title={item.title}
              className={`relative flex size-[38px] items-center justify-center rounded-[10px] text-sm transition ${
                item.active ? "bg-[var(--purple-dim)] text-purple" : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-soft)]"
              }`}
            >
              <Icon size={15} />
              {item.badge ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full border border-[var(--bg-deep)] bg-gold" /> : null}
            </button>
          </div>
        );
      })}
      <div className="mt-auto flex flex-col items-center gap-1">
        <div className="my-1 h-px w-6 bg-[var(--border)]" />
        <button title="设置" className="flex size-[38px] items-center justify-center rounded-[10px] text-[var(--text-muted)] transition hover:bg-[var(--bg-card)] hover:text-[var(--text-soft)]">
          <Cog size={15} />
        </button>
        <button title="舞台" className="hidden">
          <Mic size={15} />
        </button>
      </div>
    </nav>
  );
}
