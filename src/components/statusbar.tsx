"use client";

import { CheckCircle, Clock, Laugh, ListOrdered, Mic2 } from "lucide-react";
import { useRiffStore } from "@/store/use-riff-store";

export function Statusbar() {
  const show = useRiffStore((state) => state.show);
  const saveStatus = useRiffStore((state) => state.saveStatus);
  const saveLabel = saveStatus === "saving" ? "保存中" : saveStatus === "error" ? "保存失败" : "已自动保存";

  return (
    <div className="statusbar flex h-[25px] shrink-0 items-center border-t px-3.5">
      <StatusItem icon={Mic2}>{show.title.split("：")[0]} · {show.topic}</StatusItem>
      <StatusItem icon={ListOrdered}>
        <b>{show.bits.length}</b> 段
      </StatusItem>
      <StatusItem icon={Clock}>
        约 <b>{show.targetDurationMinutes}</b> 分钟
      </StatusItem>
      <StatusItem icon={Laugh}>
        笑点密度 <b className="text-gold">{show.analysis.averageLaughDensity}</b>
      </StatusItem>
      <div className="ml-auto flex">
        <StatusItem icon={CheckCircle} iconClassName={saveStatus === "error" ? "text-danger" : "text-teal"}>
          {saveLabel}
        </StatusItem>
        <StatusItem noBorder>
          完成度 <b className="text-purple">{show.completionRate}%</b>
        </StatusItem>
      </div>
    </div>
  );
}

function StatusItem({ icon: Icon, children, iconClassName, noBorder }: { icon?: typeof Mic2; children: React.ReactNode; iconClassName?: string; noBorder?: boolean }) {
  return (
    <div className={`flex items-center gap-1 border-r border-[var(--border)] px-2.5 text-[10.5px] text-[var(--text-faint)] first:pl-0 ${noBorder ? "border-r-0" : ""}`}>
      {Icon ? <Icon size={10} className={iconClassName} /> : null}
      <span>{children}</span>
    </div>
  );
}
