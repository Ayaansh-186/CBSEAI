import { env } from "../config";
import type { Chunk, RetrievalFilters, Source, SourceKind } from "../types";
import { signedDiagramUrl } from "./diagrams";
import { rerank } from "./reranker";
import { inferSyllabusScope } from "./syllabus-index";
import { getVectorStore } from "./vectorstore";

/**
 * Source priority. NCERT of the current year always outranks everything else —
 * that's the product's whole claim, so it's encoded here rather than left to
 * the embedding similarity.
 */
const PRIORITY: Record<SourceKind, number> = {
  ncert: 1.0,
  ms: 0.98,
  diagram: 0.94,
  exemplar: 0.92,
  pyq: 0.9,
  sqp: 0.88,
  cfpq: 0.86,
  model: 0.8,
  notes: 0.75,
};

const KIND_LABEL: Record<SourceKind, string> = {
  ncert: "NCERT",
  ms: "Marking scheme",
  diagram: "Diagram",
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
  const inferred = inferSyllabusScope(query, filters.subject);
  if (inferred.outOfSyllabus) return [];
  const scopedFilters: RetrievalFilters = {
    ...filters,
    subject: filters.subject ?? inferred.subject,
    chapters:
      filters.chapter || filters.chapters?.length
        ? filters.chapters
        : inferred.chapters,
  };

  // Hybrid retrieval over-fetches to 40; the cross-encoder then produces the
  // canonical top-8 candidate set before source-priority slotting.
  const hits = await store.search(query, {
    ...scopedFilters,
    year: filters.year ?? env.ncertYear,
    topK: Math.max(40, topK * 5),
  });

  const relevantHits = store.name === "memory"
    ? hits.filter((hit) => hit.score >= 0.18)
    : hits;
  const reranked = await rerank(query, relevantHits, Math.max(8, topK * 2));
  const ordered = reranked
    .map((h) => ({ ...h, ranked: h.score * PRIORITY[h.meta.kind] }))
    .sort((a, b) => b.ranked - a.ranked);
  const ranked = slot(ordered, filters.route ?? "theory", topK);

  // A child question hit is never allowed to reach the reasoner alone. Expand
  // its question prefix to the full question block, all sub-parts, diagrams,
  // and every available marking-scheme row for that question.
  // Do not expand a merely incidental low-score paper hit: that can drag an
  // unrelated question and marking scheme into an otherwise correct theory
  // answer. Real child/parent hits comfortably clear this floor.
  const expandable = ranked;
  const prefixes = [...new Set(expandable.map((h) => h.meta.joinPrefix).filter(Boolean))] as string[];
  const parentIds = [...new Set(expandable.map((h) => h.meta.parentId).filter(Boolean))] as string[];
  const parents = await store.findByIds(parentIds, {
    ...scopedFilters,
    year: filters.year ?? env.ncertYear,
  });
  const expanded = await store.findByJoinPrefixes(prefixes, {
    ...scopedFilters,
    year: filters.year ?? env.ncertYear,
    topK: Math.max(24, topK * 4),
  });

  const merged = new Map<string, Chunk & { score: number }>();
  ranked.forEach((hit) => merged.set(hit.id, hit));
  parents.forEach((hit) => merged.set(hit.id, hit));
  expanded
    .sort((a, b) => PRIORITY[b.meta.kind] - PRIORITY[a.meta.kind])
    .forEach((hit) => merged.set(hit.id, hit));

  return [...merged.values()].map(toSource);
}

function slot<T extends Chunk & { score: number }>(
  ordered: T[],
  route: NonNullable<RetrievalFilters["route"]>,
  limit: number,
) {
  const selected: T[] = [];
  const add = (chunk?: T) => {
    if (chunk && !selected.some((item) => item.id === chunk.id)) selected.push(chunk);
  };

  if (["theory", "numerical", "diagram", "marking", "pyq"].includes(route)) {
    add(ordered.find((chunk) => chunk.meta.kind === "ncert"));
  }
  if (route === "diagram") add(ordered.find((chunk) => chunk.meta.kind === "diagram"));
  if (route === "marking" || route === "pyq") {
    add(ordered.find((chunk) => ["pyq", "sqp", "cfpq"].includes(chunk.meta.kind)));
  }
  ordered.forEach((chunk) => {
    if (selected.length < limit) add(chunk);
  });
  return selected.slice(0, limit);
}

function toSource(chunk: Chunk & { score: number }): Source {
  const parts = [KIND_LABEL[chunk.meta.kind]];
  if (chunk.meta.subject) parts.push(titleCase(chunk.meta.subject));
  if (chunk.meta.chapter) parts.push(`Ch ${chunk.meta.chapter}`);
  if (chunk.meta.page) parts.push(`p. ${chunk.meta.page}`);

  return {
    id: chunk.id,
    kind: chunk.meta.kind,
    chunkType: chunk.meta.chunkType ?? chunk.meta.kind,
    label: parts.join(" · "),
    snippet: truncate(chunk.meta.extractiveQuote ?? chunk.text, 240),
    content: chunk.text,
    officialUrl: chunk.meta.officialUrl,
    diagramUrl: chunk.meta.kind === "diagram" ? signedDiagramUrl(chunk.id) : undefined,
    joinPrefix: chunk.meta.joinPrefix,
    joinKey: chunk.meta.joinKey,
    inActiveSyllabus: chunk.meta.inActiveSyllabus ?? true,
    subject: chunk.meta.subject,
    chapter: chunk.meta.chapter,
    page: chunk.meta.page,
    pageStart: chunk.meta.pageStart,
    pageEnd: chunk.meta.pageEnd,
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
