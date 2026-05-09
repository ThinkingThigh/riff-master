"use client";

import { useEffect } from "react";
import { useRiffStore } from "@/store/use-riff-store";

export function Toast() {
  const toast = useRiffStore((state) => state.toast);
  const dismiss = useRiffStore((state) => state.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(dismiss, 1800);
    return () => window.clearTimeout(id);
  }, [dismiss, toast]);

  if (!toast) return null;

  return (
    <div className="fade-in fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-teal px-4 py-2 text-xs font-bold text-[#0D1A17] shadow-card">
      {toast}
    </div>
  );
}
