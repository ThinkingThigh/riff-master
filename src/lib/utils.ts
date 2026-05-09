import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function secondsToLabel(seconds: number) {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `~${seconds}秒`;
  const minutes = Math.round(seconds / 60);
  return `约 ${minutes} 分钟`;
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function safeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
