"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Copy, GripVertical, Trash2, WandSparkles } from "lucide-react";
import { useEffect } from "react";
import { bitTypeMeta } from "@/lib/design-system";
import { secondsToLabel } from "@/lib/utils";
import { useRiffStore } from "@/store/use-riff-store";
import type { Bit, ReactionType } from "@/types/riffmaster";

export function BitCard({ bit }: { bit: Bit }) {
  const activeBitId = useRiffStore((state) => state.activeBitId);
  const setActiveBit = useRiffStore((state) => state.setActiveBit);
  const updateBitContent = useRiffStore((state) => state.updateBitContent);
  const reactToBit = useRiffStore((state) => state.reactToBit);
  const copyBit = useRiffStore((state) => state.copyBit);
  const deleteBit = useRiffStore((state) => state.deleteBit);
  const optimizeBit = useRiffStore((state) => state.optimizeBit);
  const meta = bitTypeMeta[bit.type];

  const editor = useEditor({
    extensions: [StarterKit],
    content: bit.html,
    editorProps: {
      attributes: {
        "aria-label": `${meta.label} 段落正文`
      }
    },
    onFocus: () => setActiveBit(bit.id),
    onUpdate: ({ editor: current }) => updateBitContent(bit.id, current.getHTML()),
    immediatelyRender: false
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== bit.html) {
      editor.commands.setContent(bit.html, { emitUpdate: false });
    }
  }, [bit.html, editor]);

  return (
    <article className="group mb-8">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className={`${meta.className} rounded px-2 py-1 text-[9.5px] font-black uppercase tracking-[0.9px]`}>{meta.label}</span>
        <span className="text-xs font-semibold text-[var(--text-muted)]">{bit.title}</span>
        <div className="ml-auto flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          <ActionButton title="AI优化" onClick={() => void optimizeBit(bit.id)} icon={WandSparkles} />
          <ActionButton title="移动" icon={GripVertical} />
          <ActionButton title="复制" onClick={() => copyBit(bit.id)} icon={Copy} />
          <ActionButton title="删除" danger onClick={() => deleteBit(bit.id)} icon={Trash2} />
        </div>
      </div>

      <div className="mb-2 flex items-center gap-1.5">
        <span className="w-[50px] shrink-0 text-[10px] text-[var(--text-muted)]">预期笑声</span>
        <span className="h-1 flex-1 overflow-hidden rounded bg-[var(--bg-card)]">
          <span
            className="block h-full rounded bg-gradient-to-r from-teal via-purple to-pink transition-all duration-700"
            style={{ width: `${bit.expectedLaughPercent ?? 0}%` }}
          />
        </span>
        <span className="w-7 shrink-0 text-right text-[10px] font-bold text-[var(--text-soft)]">{bit.expectedLaughPercent ? `${bit.expectedLaughPercent}%` : "—"}</span>
      </div>

      <div
        className={`relative rounded-xl border bg-[var(--bg-card)] py-[18px] pl-[54px] pr-5 transition ${
          activeBitId === bit.id ? "border-purple shadow-[0_0_0_3px_var(--purple-dim)]" : "border-[var(--border)] hover:border-[var(--border-bright)]"
        }`}
        onClick={() => setActiveBit(bit.id)}
      >
        <div className="absolute left-[-38px] top-4 flex size-[26px] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] text-[11px] font-bold text-[var(--text-muted)]">
          {String(bit.order).padStart(2, "0")}
        </div>
        <EditorContent editor={editor} />
        {!bit.plainText ? <div className="pointer-events-none absolute left-[54px] top-[18px] text-[15.5px] text-[var(--text-faint)]">在这里开始写这个 Bit…</div> : null}

        <div className="mt-3 flex items-center gap-2 border-t border-[var(--border)] pt-3">
          <ReactionButton active type="laugh" count={bit.reactions.laugh} label="大笑" icon="😂" onClick={() => reactToBit(bit.id, "laugh")} />
          <ReactionButton type="smile" count={bit.reactions.smile} label="微笑" icon="😄" onClick={() => reactToBit(bit.id, "smile")} />
          <ReactionButton type="flat" count={bit.reactions.flat} label="平淡" icon="😐" onClick={() => reactToBit(bit.id, "flat")} />
          <span className="flex-1" />
          <span className="text-[10.5px] text-[var(--text-faint)]">{secondsToLabel(bit.estimatedDurationSeconds)}</span>
        </div>
      </div>
    </article>
  );
}

function ActionButton({ icon: Icon, title, danger, onClick }: { icon: typeof Copy; title: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className={`flex size-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] transition hover:bg-[var(--purple-dim)] ${
        danger ? "hover:border-danger hover:text-danger" : "hover:border-purple hover:text-purple"
      }`}
    >
      <Icon size={11} />
    </button>
  );
}

function ReactionButton({ icon, label, count, active, onClick }: { type: ReactionType; icon: string; label: string; count: number; active?: boolean; onClick: () => void }) {
  return (
    <button
      className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition ${
        active ? "border-gold bg-[var(--gold-dim)] text-gold" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-bright)] hover:text-[var(--text-soft)]"
      }`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <span>{icon}</span>
      {label}
      <b className="ml-0.5">{count}</b>
    </button>
  );
}
