"use client";

import { Beef, Briefcase, HeartPulse, Lightbulb, Mic, Plus, Search, Smartphone, Train, Zap } from "lucide-react";
import { colorDimVar, colorVar } from "@/lib/design-system";
import { useRiffStore } from "@/store/use-riff-store";
import type { Material } from "@/types/riffmaster";

const tabs = ["全部", "段子", "金句", "话题"] as const;

const iconMap = {
  microphone: Mic,
  lightbulb: Lightbulb,
  train: Train,
  heart: HeartPulse,
  briefcase: Briefcase,
  phone: Smartphone,
  bowl: Beef,
  bolt: Zap
};

export function LibraryPanel() {
  const show = useRiffStore((state) => state.show);
  const selectedTab = useRiffStore((state) => state.selectedMaterialTab);
  const setMaterialTab = useRiffStore((state) => state.setMaterialTab);
  const materialSearch = useRiffStore((state) => state.materialSearch);
  const setMaterialSearch = useRiffStore((state) => state.setMaterialSearch);
  const addMaterial = useRiffStore((state) => state.addMaterial);

  const filtered = show.materials.filter((material) => {
    const query = materialSearch.trim();
    const matchesQuery = !query || `${material.title}${material.content}${material.meta}`.includes(query);
    const matchesTab =
      selectedTab === "全部" ||
      (selectedTab === "段子" && material.type === "BIT") ||
      (selectedTab === "金句" && material.type === "QUOTE") ||
      (selectedTab === "话题" && material.type === "TOPIC");
    return matchesQuery && matchesTab;
  });

  const groups = ["当前节目", "话题池", "灵感记录"] as const;

  return (
    <aside className="library-panel flex w-[252px] shrink-0 flex-col overflow-hidden border-r">
      <div className="flex items-center justify-between px-3.5 pb-2.5 pt-3.5">
        <span className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--text-muted)]">素材库</span>
        <button className="flex size-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-purple hover:text-purple" onClick={() => addMaterial("新的灵感素材")}>
          <Plus size={12} />
        </button>
      </div>

      <label className="mx-3 mb-2.5 flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-1.5 focus-within:border-purple">
        <Search size={12} className="text-[var(--text-muted)]" />
        <input
          value={materialSearch}
          onChange={(event) => setMaterialSearch(event.target.value)}
          placeholder="搜索素材、段子…"
          className="min-w-0 flex-1 border-none bg-transparent text-xs text-[var(--text-white)] outline-none placeholder:text-[var(--text-muted)]"
        />
      </label>

      <div className="mb-2 flex gap-0.5 px-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${selectedTab === tab ? "bg-[var(--bg-card)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-soft)]"}`}
            onClick={() => setMaterialTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mx-3 mb-3 h-[3px] overflow-hidden rounded bg-[var(--bg-card)]">
        <div className="h-full rounded bg-gradient-to-r from-purple via-pink to-gold transition-all" style={{ width: `${show.completionRate}%` }} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {groups.map((group) => {
          const materials = filtered.filter((material) => material.group === group);
          if (!materials.length) return null;
          return (
            <div key={group} className="mb-1">
              <div className="px-2 pb-1 pt-2.5 text-[10px] font-bold uppercase tracking-[0.7px] text-[var(--text-faint)]">{group}</div>
              {materials.map((material) => (
                <MaterialItem key={material.id} material={material} />
              ))}
            </div>
          );
        })}
        {!filtered.length ? <div className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">没有找到匹配素材</div> : null}
      </div>

      <div className="border-t border-[var(--border)] p-3">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-[9px] border border-dashed border-[var(--text-faint)] py-2 text-xs font-medium text-[var(--text-muted)] transition hover:border-gold hover:bg-[var(--gold-dim)] hover:text-gold"
          onClick={() => addMaterial("随手灵感")}
        >
          <Plus size={13} />
          记录新灵感
        </button>
      </div>
    </aside>
  );
}

function MaterialItem({ material }: { material: Material }) {
  const Icon = iconMap[material.icon as keyof typeof iconMap] ?? Lightbulb;
  return (
    <button className={`mb-0.5 flex w-full items-start gap-2.5 rounded-[9px] border p-2.5 text-left transition ${material.isMain ? "border-[rgba(155,109,255,0.3)] bg-[var(--purple-dim)]" : "border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-card)]"}`}>
      <span className="mt-px flex size-8 shrink-0 items-center justify-center rounded-lg" style={{ background: colorDimVar[material.color] }}>
        <Icon size={14} style={{ color: colorVar[material.color] }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[12.5px] font-semibold ${material.isMain ? "text-white" : "text-[var(--text-soft)]"}`}>{material.title}</span>
        <span className="mt-0.5 block truncate text-[10.5px] text-[var(--text-muted)]">{material.meta}</span>
      </span>
      {material.badge ? (
        <span className="rounded px-1.5 py-0.5 text-[9.5px] font-bold" style={{ background: colorDimVar[material.color], color: colorVar[material.color] }}>
          {material.badge}
        </span>
      ) : null}
    </button>
  );
}
