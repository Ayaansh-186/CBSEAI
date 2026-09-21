import { env } from "@/lib/config";
import { getVectorStore } from "@/lib/rag/vectorstore";

export const runtime = "nodejs";

export async function GET() {
  const store = getVectorStore();
  let count: number | null = null;
  let error: string | undefined;

  try {
    await store.initialize();
    count = await store.count();
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not reach vector store";
  }

  return Response.json({
    ragProvider: env.ragProvider,
    store: store.name,
    chunks: count,
    ncertYear: env.ncertYear,
    embeddingsProvider: env.embeddingsProvider,
    embeddingsModel: env.embeddingsModel || null,
    hybridSearch: env.ragProvider === "qdrant" ? env.hybridSearch : false,
    sparseEmbeddings: env.sparseEmbeddingsBaseUrl ? "remote" : "local-lexical",
    reranker: env.rerankerBaseUrl ? env.rerankerModel : "retrieval-order fallback",
    cache: env.cacheProvider,
    nli: env.nliBaseUrl ? env.nliModel : "structural-only",
    diagrams: env.diagramSigningSecret ? "signed" : "not-configured",
    ingestAuth: Boolean(env.ingestApiKey),
    qdrantCollection:
      env.ragProvider === "qdrant" ? env.qdrantCollection : null,
    ready: !error,
    error,
  });
}
