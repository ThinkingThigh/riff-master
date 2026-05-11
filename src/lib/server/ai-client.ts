export type AIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIClientConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
};

export function getAIClientConfig(): AIClientConfig | null {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || process.env.AI_BASE_URL;
  const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "kimi-k2.5";
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 60000);

  if (!apiKey || !baseUrl) return null;
  return {
    apiKey,
    baseUrl,
    model,
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : 60000
  };
}

export async function chatCompletionText(
  messages: AIChatMessage[],
  options: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {}
) {
  const config = getAIClientConfig();
  if (!config) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? config.timeoutMs);

  try {
    let lastStatus = 0;
    for (const url of buildChatCompletionsUrls(config.baseUrl)) {
      for (const authHeaders of buildAuthHeaderCandidates(config.apiKey)) {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-openclaw-agent-id": process.env.OPENCLAW_AGENT_ID || "main",
            ...authHeaders
          },
          body: JSON.stringify({
            model: config.model,
            temperature: options.temperature ?? 0.4,
            max_tokens: options.maxTokens ?? 900,
            messages
          }),
          signal: controller.signal
        });

        if (!response.ok) {
          lastStatus = response.status;
          if ([401, 403, 404, 405].includes(response.status)) continue;
          throw new Error(`AI service returned ${response.status}`);
        }

        const result = await response.json();
        const content = result?.choices?.[0]?.message?.content;
        if (!content || typeof content !== "string") {
          throw new Error("AI response has no message content");
        }
        return content.trim();
      }
    }

    throw new Error(`AI service returned ${lastStatus || "no response"}`);
  } finally {
    clearTimeout(timer);
  }
}

export function parseJsonObject(content: string) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

function buildChatCompletionsUrls(baseUrl: string) {
  const base = baseUrl.replace(/\/+$/, "");
  if (base.endsWith("/chat/completions")) return [base];
  if (base.endsWith("/v1")) return [`${base}/chat/completions`];
  return [`${base}/v1/chat/completions`, `${base}/chat/completions`];
}

function buildAuthHeaderCandidates(apiKey: string): Array<Record<string, string>> {
  const basicToken = Buffer.from(apiKey).toString("base64");
  return [
    { Authorization: `Bearer ${apiKey}` },
    { Authorization: apiKey },
    { "X-API-Key": apiKey },
    { "api-key": apiKey },
    { Authorization: `Basic ${basicToken}` }
  ];
}
