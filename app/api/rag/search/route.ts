import { retrieve } from "@/lib/rag/retriever";
import type { SourceKind, SubjectId } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Retrieval on its own, so you can eyeball what the model is being fed
 * without generating an answer. Useful while tuning chunk size and priority.
 *
 *   GET /api/rag/search?q=ohm's+law&subject=science&chapter=11
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  if (!q) {
    return Response.json({ error: "Pass a query as ?q=" }, { status: 400 });
  }

  const kinds = url.searchParams.get("kinds");

  try {
    const sources = await retrieve(q, {
      subject: (url.searchParams.get("subject") as SubjectId) ?? undefined,
      chapter: Number(url.searchParams.get("chapter")) || undefined,
      kinds: kinds ? (kinds.split(",") as SourceKind[]) : undefined,
      topK: Number(url.searchParams.get("topK")) || 8,
    });
    return Response.json({ query: q, count: sources.length, sources });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Retrieval failed" },
      { status: 500 },
    );
  }
}
