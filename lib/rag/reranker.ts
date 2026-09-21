import { env } from "../config";
import type { Chunk } from "../types";

type RankedChunk = Chunk & { score: number };

export async function rerank(
  query: string,
  chunks: RankedChunk[],
  limit: number,
): Promise<RankedChunk[]> {
  if (!chunks.length) return [];
  if (!env.rerankerBaseUrl) return chunks.slice(0, limit);

  try {
    const res = await fetch(env.rerankerBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.rerankerApiKey
          ? { Authorization: `Bearer ${env.rerankerApiKey}` }
          : {}),
      },
      body: JSON.stringify({
        model: env.rerankerModel,
        query,
        documents: chunks.map((chunk) => chunk.text),
        top_n: Math.min(limit, chunks.length),
        return_documents: false,
      }),
    });
    if (!res.ok) throw new Error(`reranker returned ${res.status}`);
    const json = await res.json();
    const rows = json.results ?? json.data ?? [];
    return rows
      .map((row: { index: number; relevance_score?: number; score?: number }) => {
        const chunk = chunks[row.index];
        return chunk
          ? { ...chunk, score: row.relevance_score ?? row.score ?? chunk.score }
          : null;
      })
      .filter(Boolean) as RankedChunk[];
  } catch (error) {
    console.warn("reranker unavailable; using retrieval order", error);
    return chunks.slice(0, limit);
  }
}
