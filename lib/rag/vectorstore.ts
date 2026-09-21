import { env } from "../config";
import type { Chunk, RetrievalFilters } from "../types";
import { cosine, getEmbedder } from "./embeddings";
import { SEED_CHUNKS } from "./seed";

export interface VectorStore {
  name: string;
  upsert(chunks: Chunk[]): Promise<void>;
  search(
    query: string,
    filters: RetrievalFilters,
  ): Promise<(Chunk & { score: number })[]>;
  count(): Promise<number>;
}

/* ────────────────────────── in-memory ──────────────────────────────────── */

/**
 * Holds the corpus in the Node process. Fine for the seed set and for local
 * work; it resets on every deploy, so move to Qdrant before the December
 * launch.
 */
function createMemoryStore(): VectorStore {
  const store: (Chunk & { embedding: number[] })[] = [];
  let warmed: Promise<void> | null = null;

  async function warm() {
    if (!warmed) {
      warmed = (async () => {
        const embedder = getEmbedder();
        const vectors = await embedder.embed(SEED_CHUNKS.map((c) => c.text));
        SEED_CHUNKS.forEach((c, i) =>
          store.push({ ...c, embedding: vectors[i] }),
        );
      })();
    }
    return warmed;
  }

  return {
    name: "memory",
    async upsert(chunks) {
      await warm();
      const embedder = getEmbedder();
      const vectors = await embedder.embed(chunks.map((c) => c.text));
      chunks.forEach((c, i) => {
        const idx = store.findIndex((s) => s.id === c.id);
        const row = { ...c, embedding: vectors[i] };
        if (idx >= 0) store[idx] = row;
        else store.push(row);
      });
    },
    async search(query, filters) {
      await warm();
      const embedder = getEmbedder();
      const [qv] = await embedder.embed([query]);

      const year = filters.year ?? env.ncertYear;
      return store
        .filter((c) => c.meta.year === year)
        .filter((c) => !filters.subject || c.meta.subject === filters.subject)
        .filter((c) => !filters.chapter || c.meta.chapter === filters.chapter)
        .filter((c) => !filters.kinds?.length || filters.kinds.includes(c.meta.kind))
        .map((c) => ({ ...c, score: cosine(qv, c.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, filters.topK ?? 5);
    },
    async count() {
      await warm();
      return store.length;
    },
  };
}

/* ──────────────────────────── Qdrant ───────────────────────────────────── */

/**
 * Recommended production store. Create the collection with the embedder's
 * dimension and payload indexes on subject, chapter, kind and year, then fill
 * in the two fetches below — the interface above is all the app depends on.
 *
 *   PUT /collections/{c}   { vectors: { size, distance: "Cosine" } }
 *   PUT /collections/{c}/index   { field_name: "year", field_schema: "keyword" }
 */
function createQdrantStore(): VectorStore {
  return {
    name: "qdrant",
    async upsert() {
      throw new Error(
        "Qdrant upsert not implemented. See lib/rag/vectorstore.ts — POST /collections/{c}/points with { id, vector, payload: chunk.meta }.",
      );
    },
    async search() {
      throw new Error(
        "Qdrant search not implemented. See lib/rag/vectorstore.ts — POST /collections/{c}/points/search with a `filter` on meta.year and meta.subject.",
      );
    },
    async count() {
      return 0;
    },
  };
}

/* ─────────────────────────── selection ─────────────────────────────────── */

let singleton: VectorStore | null = null;

export function getVectorStore(): VectorStore {
  if (singleton) return singleton;
  singleton =
    env.ragProvider === "qdrant" ? createQdrantStore() : createMemoryStore();
  return singleton;
}
