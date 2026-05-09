import { z } from "zod";

export const bitTypeSchema = z.enum([
  "SETUP",
  "PUNCHLINE",
  "TAGLINE",
  "CALLBACK",
  "OBSERVATIONAL",
  "SELF_DEPRECATION"
]);

export const reactionCountsSchema = z.object({
  laugh: z.number().int().nonnegative(),
  smile: z.number().int().nonnegative(),
  flat: z.number().int().nonnegative()
});

export const bitSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  type: bitTypeSchema,
  title: z.string(),
  html: z.string(),
  plainText: z.string(),
  expectedLaughPercent: z.number().int().min(0).max(100).nullable(),
  estimatedDurationSeconds: z.number().int().nonnegative(),
  reactions: reactionCountsSchema,
  keywords: z.array(z.string())
});

export const aiSuggestionSchema = z.object({
  id: z.string(),
  type: z.enum(["strength", "optimize", "idea", "callback"]),
  priority: z.enum(["高优", "优化", "建议", "亮点"]),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  relatedBitId: z.string().optional()
});

export const aiOptimizeResultSchema = z.object({
  title: z.string(),
  suggestion: z.string(),
  generatedBit: z
    .object({
      type: bitTypeSchema,
      title: z.string(),
      html: z.string(),
      plainText: z.string(),
      estimatedDurationSeconds: z.number().int().nonnegative(),
      keywords: z.array(z.string())
    })
    .optional()
});

export const aiChatRequestSchema = z.object({
  showId: z.string(),
  message: z.string().min(1),
  activeBitId: z.string().optional(),
  selectedText: z.string().optional()
});

export const saveShowSchema = z.object({
  title: z.string().min(1).max(80),
  bits: z.array(bitSchema),
  completionRate: z.number().int().min(0).max(100)
});

export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;
