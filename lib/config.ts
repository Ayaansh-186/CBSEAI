import type { AnswerMode } from "./types";

/** Rename here and it changes everywhere. Kept broad — we expand past class 10. */
export const APP = {
  name: "Padhle",
  tagline: "Answers that get the marks.",
  grade: 10 as const,
  board: "CBSE",
};

export const env = {
  modelProvider: process.env.MODEL_PROVIDER ?? "mock",
  modelBaseUrl: process.env.MODEL_BASE_URL ?? "",
  modelApiKey: process.env.MODEL_API_KEY ?? "",
  modelName: process.env.MODEL_NAME ?? "",
  visionModelName: process.env.VISION_MODEL_NAME ?? "",

  ragProvider: process.env.RAG_PROVIDER ?? "memory",
  qdrantUrl: process.env.QDRANT_URL ?? "",
  qdrantApiKey: process.env.QDRANT_API_KEY ?? "",
  qdrantCollection: process.env.QDRANT_COLLECTION ?? "ncert",
  qdrantAutoCreate: process.env.QDRANT_AUTO_CREATE !== "false",
  qdrantVectorSize: Number(process.env.QDRANT_VECTOR_SIZE ?? "1024"),
  hybridSearch: process.env.HYBRID_SEARCH !== "false",

  embeddingsProvider: process.env.EMBEDDINGS_PROVIDER ?? "mock",
  embeddingsBaseUrl: process.env.EMBEDDINGS_BASE_URL ?? "",
  embeddingsApiKey: process.env.EMBEDDINGS_API_KEY ?? "",
  embeddingsModel: process.env.EMBEDDINGS_MODEL ?? "",
  sparseEmbeddingsBaseUrl:
    process.env.SPARSE_EMBEDDINGS_BASE_URL ?? process.env.EMBEDDINGS_BASE_URL ?? "",
  sparseEmbeddingsApiKey:
    process.env.SPARSE_EMBEDDINGS_API_KEY ?? process.env.EMBEDDINGS_API_KEY ?? "",
  sparseEmbeddingsModel: process.env.SPARSE_EMBEDDINGS_MODEL ?? "BAAI/bge-m3",

  rerankerBaseUrl: process.env.RERANKER_BASE_URL ?? "",
  rerankerApiKey: process.env.RERANKER_API_KEY ?? "",
  rerankerModel: process.env.RERANKER_MODEL ?? "BAAI/bge-reranker-v2-m3",

  cacheProvider: process.env.CACHE_PROVIDER ?? "memory",
  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS ?? "3600"),
  redisRestUrl: process.env.REDIS_REST_URL ?? "",
  redisRestToken: process.env.REDIS_REST_TOKEN ?? "",

  nliBaseUrl: process.env.NLI_BASE_URL ?? "",
  nliApiKey: process.env.NLI_API_KEY ?? "",
  nliModel: process.env.NLI_MODEL ?? "MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli",
  nliThreshold: Number(process.env.NLI_THRESHOLD ?? "0.72"),

  ingestApiKey: process.env.INGEST_API_KEY ?? "",
  diagramDir: process.env.DIAGRAM_DIR ?? "data/diagrams",
  diagramSigningSecret: process.env.DIAGRAM_SIGNING_SECRET ?? "",
  diagramUrlTtlSeconds: Number(process.env.DIAGRAM_URL_TTL_SECONDS ?? "900"),

  /** The corpus year. Retrieval hard-filters on this. */
  ncertYear: process.env.NCERT_YEAR ?? "2026-27",
};

export const MODES: { id: AnswerMode; label: string; hint: string }[] = [
  { id: "answer", label: "Board answer", hint: "Written the way you'd write it in the exam" },
  { id: "explain", label: "Explain", hint: "Understand it before you memorise it" },
  { id: "revise", label: "Revise", hint: "Thirty seconds, the night before" },
  { id: "drill", label: "Ask me", hint: "Three questions, then I tell you what you missed" },
];

/** Marks change answer length more than anything else, so they're a first-class control. */
export const MARK_OPTIONS = [1, 2, 3, 5] as const;
