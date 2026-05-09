import { NextResponse } from "next/server";
import { saveShowSchema } from "@/lib/contracts";

export async function PUT(request: Request, context: { params: Promise<{ showId: string }> }) {
  const { showId } = await context.params;
  const body = await request.json();
  const parsed = saveShowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid show payload", issues: parsed.error.issues }, { status: 400 });
  }

  return NextResponse.json({
    showId,
    savedAt: new Date().toISOString(),
    status: "saved"
  });
}
