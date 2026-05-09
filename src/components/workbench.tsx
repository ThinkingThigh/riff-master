"use client";

import { useEffect } from "react";
import { EditorMain } from "@/components/editor-main";
import { IconRail } from "@/components/icon-rail";
import { LibraryPanel } from "@/components/library-panel";
import { RehearsalModal } from "@/components/rehearsal-modal";
import { RightPanel } from "@/components/right-panel";
import { Statusbar } from "@/components/statusbar";
import { Toast } from "@/components/toast";
import { Topbar } from "@/components/topbar";
import { useRiffStore } from "@/store/use-riff-store";

export function Workbench() {
  const hydrate = useRiffStore((state) => state.hydrate);
  const show = useRiffStore((state) => state.show);
  const saveStatus = useRiffStore((state) => state.saveStatus);
  const markSaved = useRiffStore((state) => state.markSaved);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (saveStatus !== "saving") return;
    const id = window.setTimeout(() => markSaved(), 900);
    return () => window.clearTimeout(id);
  }, [markSaved, saveStatus, show]);

  return (
    <div className="app-shell">
      <div className="stage-glow" />
      <Topbar />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <IconRail />
        <LibraryPanel />
        <EditorMain />
        <RightPanel />
      </div>
      <Statusbar />
      <RehearsalModal />
      <Toast />
    </div>
  );
}
