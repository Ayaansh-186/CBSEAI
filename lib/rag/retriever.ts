import { env } from "../config";
import type { Chunk, RetrievalFilters, Source, SourceKind } from "../types";
import { getVectorStore } from "./vectorstore";

/**
 * Source priority. NCERT of the current year always outranks everything else —
 * that's the product's whole claim, so it's encoded here rather than left to
 * the embedding similarity.
 */
const PRIORITY: Record<SourceKind, number> = {
  ncert: 1.0,
  exemplar: 0.92,
  pyq: 0.9,
  sqp: 0.88,
  cfpq: 0.86,
  model: 0.8,
  notes: 0.75,
};

const KIND_LABEL: Record<SourceKind, string> = {
  ncert: "NCERT",
  exemplar: "Exemplar",
  pyq: "PYQ",
  sqp: "Sample paper",
  cfpq: "CFPQ",
  model: "Model paper",
  notes: "Notes",
};

export async function retrieve(
  query: string,
  filters: RetrievalFilters = {},
): Promise<Source[]> {
  const store = getVectorStore();
  const topK = filters.topK ?? 5;

  // Over-fetch, then rerank by source priority and trim.
  const hits = await store.search(query, {
    ...filters,
    year: filters.year ?? env.ncertYear,
    topK: topK * 3,
  });

  return hits
    .map((h) => ({ ...h, ranked: h.score * PRIORITY[h.meta.kind] }))
    .sort((a, b) => b.ranked - a.ranked)
    .slice(0, topK)
    .map(toSource);
}

function toSource(chunk: Chunk & { score: number }): Source {
  const parts = [KIND_LABEL[chunk.meta.kind]];
  if (chunk.meta.subject) parts.push(titleCase(chunk.meta.subject));
  if (chunk.meta.chapter) parts.push(`Ch ${chunk.meta.chapter}`);
  if (chunk.meta.page) parts.push(`p. ${chunk.meta.page}`);

  return {
    id: chunk.id,
    kind: chunk.meta.kind,
    label: parts.join(" · "),
    snippet: truncate(chunk.text, 240),
    subject: chunk.meta.subject,
    chapter: chunk.meta.chapter,
    page: chunk.meta.page,
    year: chunk.meta.year,
    score: chunk.score,
  };
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : `${s.slice(0, n).trimEnd()}…`;
}

/**
 * Paragraph-aware chunking for the ingestion route.
 *
 * NCERT pages are short and already well-segmented, so paragraph boundaries
 * beat fixed-size windows here. Keep `maxChars` near 900 — long chunks blur
 * the citation and the snippet stops being quotable in the answer sheet.
 */
export function chunkText(
  text: string,
  meta: Chunk["meta"],
  opts: { maxChars?: number; overlap?: number } = {},
): Chunk[] {
  const maxChars = opts.maxChars ?? 900;
  const overlap = opts.overlap ?? 120;

  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const chunks: Chunk[] = [];
  let buffer = "";

  const flush = () => {
    if (!buffer.trim()) return;
    chunks.push({
      id: `${meta.subject}-${meta.chapter}-${meta.kind}-${chunks.length}`,
      text: buffer.trim(),
      meta,
    });
    buffer = buffer.slice(-overlap);
  };

  for (const p of paragraphs) {
    if ((buffer + " " + p).length > maxChars) flush();
    buffer += (buffer ? " " : "") + p;
  }
  flush();

  return chunks;
}
