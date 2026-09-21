import { env } from "../config";

export interface Embedder {
  name: string;
  dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}

/** Any OpenAI-compatible /v1/embeddings endpoint. BGE-M3 is a good default
 *  for this corpus — it handles Devanagari and English in one model, which
 *  matters once Hindi and SST are ingested. */
const remote: Embedder = {
  name: "remote",
  dimensions: 1024,
  async embed(texts) {
    const res = await fetch(`${env.embeddingsBaseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(env.embeddingsApiKey
          ? { Authorization: `Bearer ${env.embeddingsApiKey}` }
          : {}),
      },
      body: JSON.stringify({ model: env.embeddingsModel, input: texts }),
    });
    if (!res.ok) {
      throw new Error(`Embeddings endpoint returned ${res.status}`);
    }
    const json = await res.json();
    return json.data.map((d: { embedding: number[] }) => d.embedding);
  },
};

/** Deterministic hashing embedder. Good enough to exercise the plumbing and
 *  to keep tests offline; useless for real semantic search. */
const mock: Embedder = {
  name: "mock",
  dimensions: 256,
  async embed(texts) {
    return texts.map((text) => {
      const v = new Array(256).fill(0);
      for (const token of text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) {
        let h = 2166136261;
        for (let i = 0; i < token.length; i++) {
          h ^= token.charCodeAt(i);
          h = Math.imul(h, 16777619);
        }
        v[Math.abs(h) % 256] += 1;
      }
      const norm = Math.hypot(...v) || 1;
      return v.map((x) => x / norm);
    });
  },
};

export function getEmbedder(): Embedder {
  return env.embeddingsProvider === "mock" ? mock : remote;
}

export function cosine(a: number[], b: number[]) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are pre-normalised
}
