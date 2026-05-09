import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  const html = await readFile(join(process.cwd(), "ui.html"), "utf8");

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8"
    }
  });
}
