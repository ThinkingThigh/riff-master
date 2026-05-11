import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";

const prototypeShowSchema = z.object({
  title: z.string().default("未命名节目"),
  bits: z.array(
    z.object({
      type: z.string().default("OBSERVATIONAL"),
      html: z.string().default(""),
      score: z.string().optional(),
      duration: z.string().optional(),
      reactions: z
        .object({
          laugh: z.number().optional(),
          smile: z.number().optional(),
          flat: z.number().optional()
        })
        .optional()
    })
  )
});

const dataPath = join(process.cwd(), ".riffmaster-data", "prototype-show.json");

export async function GET() {
  const draft = await readDraft();
  return NextResponse.json({
    show: draft,
    isEmpty: !draft || draft.bits.length === 0
  });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const parsed = prototypeShowSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid prototype show payload", issues: parsed.error.issues }, { status: 400 });
  }

  const payload = {
    ...parsed.data,
    updatedAt: new Date().toISOString()
  };
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, JSON.stringify(payload, null, 2), "utf8");

  return NextResponse.json({
    show: payload,
    savedAt: payload.updatedAt,
    status: "saved"
  });
}

async function readDraft() {
  try {
    const raw = await readFile(dataPath, "utf8");
    return prototypeShowSchema.parse(JSON.parse(raw));
  } catch {
    return {
      title: "未命名节目",
      bits: []
    };
  }
}
