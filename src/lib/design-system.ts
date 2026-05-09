import type { BitType } from "@/types/riffmaster";

export const bitTypeMeta: Record<
  BitType,
  {
    label: string;
    shortLabel: string;
    title: string;
    className: string;
  }
> = {
  SETUP: {
    label: "SETUP",
    shortLabel: "S",
    title: "开场铺垫",
    className: "tag-setup"
  },
  PUNCHLINE: {
    label: "PUNCHLINE",
    shortLabel: "P",
    title: "核心笑点",
    className: "tag-punchline"
  },
  TAGLINE: {
    label: "TAGLINE",
    shortLabel: "T",
    title: "补充笑点",
    className: "tag-tagline"
  },
  CALLBACK: {
    label: "CALLBACK",
    shortLabel: "C",
    title: "回扣笑点",
    className: "tag-callback"
  },
  OBSERVATIONAL: {
    label: "观察类",
    shortLabel: "O",
    title: "生活素材",
    className: "tag-observational"
  },
  SELF_DEPRECATION: {
    label: "自嘲",
    shortLabel: "自",
    title: "个人反差",
    className: "tag-self"
  }
};

export const colorVar = {
  purple: "var(--purple)",
  gold: "var(--gold)",
  teal: "var(--teal)",
  pink: "var(--pink)",
  orange: "var(--orange)",
  red: "var(--red)",
  muted: "var(--text-muted)"
} as const;

export const colorDimVar = {
  purple: "var(--purple-dim)",
  gold: "var(--gold-dim)",
  teal: "var(--teal-dim)",
  pink: "var(--pink-dim)",
  orange: "var(--orange-dim)",
  red: "rgba(255, 77, 109, 0.12)"
} as const;

export const componentInventory = [
  "Topbar",
  "IconRail",
  "LibraryPanel",
  "EditorToolbar",
  "BitCard",
  "QuickInput",
  "RightPanel",
  "AnalysisTab",
  "ChatTab",
  "WordCloudTab",
  "ReferenceTab",
  "RehearsalModal",
  "Statusbar",
  "FloatingSelectionToolbar"
];

export const responsiveBreakpoints = {
  compactRightPanel: 1100,
  hideRightPanel: 960,
  hideLibrary: 720,
  hideIconRail: 520
};
