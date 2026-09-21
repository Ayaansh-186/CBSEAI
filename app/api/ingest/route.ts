import { chunkText } from "@/lib/rag/retriever";
import { getVectorStore } from "@/lib/rag/vectorstore";
import { env } from "@/lib/config";
import type { Chunk } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Corpus ingestion.
 *
 * Send either raw text to be chunked here, or pre-chunked rows if your PDF
 * pipeline already handles segmentation (it probably should — page numbers are
 * easier to keep accurate upstream).
 *
 *   POST /api/ingest
 *   { "text": "...", "meta": { "kind": "ncert", "subject": "science",
 *                              "chapter": 5, "page": 95 } }
 *
 *   POST /api/ingest
 *   { "chunks": [ { "id": "...", "text": "...", "meta": { ... } } ] }
 *
 * Before launch: put an auth check at the top of this handler.
 */
export async function POST(req: Request) {
  const body = await req.json();
  const store = getVectorStore();

  try {
    let chunks: Chunk[];

    if (Array.isArray(body.chunks)) {
      chunks = body.chunks.map((c: Chunk) => ({
        ...c,
        meta: { year: env.ncertYear, ...c.meta },
      }));
    } else if (typeof body.text === "string" && body.meta) {
      chunks = chunkText(body.text, { year: env.ncertYear, ...body.meta });
    } else {
      return Response.json(
        { error: "Send { text, meta } or { chunks }." },
        { status: 400 },
      );
    }

    await store.upsert(chunks);
    return Response.json({
      ingested: chunks.length,
      total: await store.count(),
      store: store.name,
      year: env.ncertYear,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Ingestion failed" },
      { status: 500 },
    );
  }
}
