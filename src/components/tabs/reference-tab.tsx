"use client";

import { PersonStanding, Repeat, TriangleAlert, VenetianMask } from "lucide-react";
import { SectionTitle } from "@/components/right-panel";
import { useRiffStore } from "@/store/use-riff-store";

const refs = [
  {
    title: "Callback 技巧",
    icon: Repeat,
    color: "text-purple",
    prompt: "请用 Callback 技巧改写当前稿件结尾",
    desc: "在节目后段重新提起前段的某个细节或词语，制造“哦！原来如此”的意外感。"
  },
  {
    title: "Rule of Three",
    icon: TriangleAlert,
    color: "text-gold",
    prompt: "请用 Rule of Three 为当前主题生成一个三段式笑点",
    desc: "前两个词建立规律，第三个词打破期待。C 就是笑点所在。"
  },
  {
    title: "Misdirection",
    icon: VenetianMask,
    color: "text-teal",
    prompt: "请用 Misdirection 技巧优化当前段落",
    desc: "引导观众往一个方向思考，然后用完全相反或意料之外的方向作为结尾。"
  },
  {
    title: "自嘲型共情",
    icon: PersonStanding,
    color: "text-pink",
    prompt: "请生成一个自嘲型共情 Bit",
    desc: "表演者先把自己贬低，观众会在笑中产生“我也这样”的代入感。"
  }
];

export function ReferenceTab() {
  const sendAiMessage = useRiffStore((state) => state.sendAiMessage);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3.5">
      <SectionTitle>经典脱口秀手法</SectionTitle>
      <div className="flex flex-col gap-2">
        {refs.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.title} className="soft-card rounded-[9px] p-3 text-left hover:border-[rgba(155,109,255,0.35)]" onClick={() => void sendAiMessage(item.prompt)}>
              <div className={`mb-1.5 flex items-center gap-1.5 text-xs font-bold ${item.color}`}>
                <Icon size={12} />
                {item.title}
              </div>
              <div className="text-[11px] leading-normal text-[var(--text-muted)]">{item.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
