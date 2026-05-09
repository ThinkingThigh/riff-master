import type { Bit } from "@/types/riffmaster";

export function calculateLaughDensity(bits: Bit[]) {
  if (!bits.length) return 0;
  const total = bits.reduce((sum, bit) => sum + (bit.expectedLaughPercent ?? 50), 0);
  return Number((total / bits.length / 10).toFixed(1));
}

export function calculateCompletionRate(bits: Bit[]) {
  if (!bits.length) return 0;
  const filled = bits.filter((bit) => bit.plainText.trim().length >= 12).length;
  const structureScore = Math.min(bits.length, 8) * 4;
  return Math.min(100, Math.round((filled / bits.length) * 70 + structureScore));
}
