import { NextResponse } from "next/server";
import { aiChatRequestSchema } from "@/lib/contracts";
import { mockChatWithContext } from "@/lib/ai";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = aiChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid AI chat request", issues: parsed.error.issues }, { status: 400 });
  }

  const message = await mockChatWithContext(parsed.data.message);
  return NextResponse.json({ message });
}
