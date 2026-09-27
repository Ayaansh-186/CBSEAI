import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/config";
import { verifyDiagramSignature } from "@/lib/rag/diagrams";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const url = new URL(req.url);
  const expires = Number(url.searchParams.get("expires"));
  const signature = url.searchParams.get("signature") ?? "";

  if (!/^[A-Za-z0-9_-]+$/.test(id) || !verifyDiagramSignature(id, expires, signature)) {
    return Response.json({ error: "Invalid or expired diagram URL" }, { status: 403 });
  }

  const root = path.resolve(env.diagramDir);
  const file = path.resolve(root, `${id}.webp`);
  if (!file.startsWith(`${root}${path.sep}`)) {
    return Response.json({ error: "Invalid diagram id" }, { status: 400 });
  }

  try {
    const bytes = await readFile(file);
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": `private, max-age=${Math.min(env.diagramUrlTtlSeconds, 900)}`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json({ error: "Diagram not found" }, { status: 404 });
  }
}
