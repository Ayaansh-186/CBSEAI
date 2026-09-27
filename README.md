# Padhle

A CBSE Class 10 tutor interface with a source-grounded chat pipeline. The app retrieves relevant corpus chunks before calling an OpenAI-compatible model endpoint, displays source cards, and checks citations and mark allocations before showing an answer.

The repository contains **no textbook or paper corpus and no model endpoint credentials**. The earlier hand-written demo chunks have been removed. Until source rows are ingested, chat explains that no matching CBSE source is loaded. Once sources are loaded, the model connection must also be configured to generate answers.

## Run locally

```sh
npm ci
cp .env.example .env.local
npm run dev
```

In `.env.local`, set a long random `INGEST_API_KEY`. Set `MODEL_PROVIDER=openai`, `MODEL_BASE_URL`, and `MODEL_NAME` when your model service is available; add `MODEL_API_KEY` if required. `MODEL_BASE_URL` should end in `/v1`. A vision model can be selected with `VISION_MODEL_NAME` for image turns that also include a text question.

The local `RAG_PROVIDER=memory` store starts empty and loses ingested rows on restart. Use `RAG_PROVIDER=qdrant` with Qdrant and a real embeddings endpoint for a persistent corpus. The mock embedder is useful only for local plumbing checks, not production retrieval.

## Add the source files

Your friend's PDFs need extraction into text chunks with source metadata before ingestion. The expected JSON shape, required metadata, source allowlist, and exam question joins are in [DATA_CONTRACT.md](DATA_CONTRACT.md). Send the resulting JSON to `POST /api/ingest` with `Authorization: Bearer <INGEST_API_KEY>`. The API accepts `{ "chunks": [...] }` or `{ "text": "...", "meta": { ... } }`.

Use `GET /api/rag/status` to see whether the corpus and model are configured. Use `GET /api/rag/search?q=ohm%27s+law&subject=science&chapter=11` to inspect retrieved evidence before asking chat to answer. No generated answer is produced when retrieval finds no matching source.

## Verify

```sh
npm run typecheck
npm test
npm run build
```

The Chapters, Weak spots, and Study plan screens still use sample syllabus and mastery data; they are not yet personalized from student attempts.
