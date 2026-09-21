# Padhle

A CBSE Class 10 tutor that writes answers the way the marking scheme reads them.
The application path is complete; production services and the extracted
official corpus are configured through environment variables.

```bash
npm install
cp .env.example .env.local
npm run dev
```

It runs out of the box on `MODEL_PROVIDER=mock`, which streams canned board
answers so the interface, citations, sources, and mark controls can be tested
before the production services are connected.

---

## Where things are

```
app/
  page.tsx              Ask — the chat
  subjects/             Chapters, by subject
  graph/                Weak spots
  plan/                 This week, and what to study from
  api/chat/             Retrieve → prompt → stream (SSE)
  api/rag/search/       Retrieval on its own, for eyeballing
  api/ingest/           Corpus in
lib/
  ai/provider.ts        ← the model seam
  ai/prompt.ts          ← how it's told to answer
  rag/retriever.ts      Hybrid retrieve, rerank, slot, parent expand
  rag/vectorstore.ts    Qdrant named dense+sparse vectors and RRF
  rag/cache.ts          FAQ cache (memory or Redis REST)
  ai/verifier.ts        Citations, marks, and MNLI orchestration
  data/syllabus.ts      Chapter lists (re-check every April)
  data/mastery.ts       Placeholder mastery data
components/chat/        The answer sheet
```

## Plugging in the fine-tuned model

Three environment variables, nothing else:

```bash
MODEL_PROVIDER=openai
MODEL_BASE_URL=https://your-endpoint/v1
MODEL_API_KEY=...
MODEL_NAME=Qwen/Qwen2.5-VL-7B-Instruct-AWQ
```

`lib/ai/provider.ts` speaks the OpenAI chat-completions protocol, which is what
vLLM, SGLang, Nebius, Together, Fireworks and Ollama all serve. If you host
Qwen2.5-VL-7B any of those ways, nothing in the app changes.

Images are already wired end to end. A photographed question goes up as a data
URL in the `image_url` part shape Qwen2.5-VL expects, and if `VISION_MODEL_NAME`
is set, turns containing an image route to the Qwen VL checkpoint.

### What the model has to emit

Two conventions, both parsed:

| The model writes | The app renders |
|---|---|
| `**oxidising agent**` | a bold scoring keyword |
| `[S1]` | a citation chip, tap to open the NCERT snippet |
| `MARKS: 3 \| 1 — states the law \| 1 — balanced equation \| 1 — observation` | the verified marks panel |

The `MARKS:` line is stripped before display, so it never flashes on screen as
text. Put these in the training data and the prompt clauses that ask for them
can be deleted — which is the point of fine-tuning them in.

## Plugging in RAG

`POST /api/ingest` with the bearer key and preferably pre-chunked rows:

```bash
curl -X POST localhost:3000/api/ingest \
  -H 'authorization: Bearer YOUR_INGEST_API_KEY' \
  -H 'content-type: application/json' -d '{
  "text": "...page text...",
  "meta": { "kind": "ncert", "subject": "science", "chapter": 5, "page": 95 }
}'
```

`kind` is one of `ncert | exemplar | pyq | sqp | ms | diagram | cfpq | model | notes`, and it
matters: `lib/rag/retriever.ts` reranks by source priority, so current-year
NCERT outranks everything else regardless of embedding similarity. That
ordering is the product's claim, so it lives in code rather than in the index.

Every chunk is stamped with `NCERT_YEAR` and retrieval hard-filters on it. When
NCERT changes, bump the year, re-ingest, and last year's text can't leak into an
answer even if it's still sitting in the store.

The default store is in-memory and resets on deploy. With `RAG_PROVIDER=qdrant`,
the app creates the Qdrant collection, named dense and sparse vectors, and
payload indexes automatically. Retrieval uses Qdrant's Query API with RRF,
then the configured BGE reranker, source slotting, and parent/join expansion.

Check what the model is being fed without generating anything:

```
GET /api/rag/search?q=ohm's+law&subject=science&chapter=11
```

## Production services

- Qdrant 1.13+ for hybrid dense+sparse retrieval.
- BGE-M3 dense embeddings and optional lexical-weight endpoint.
- BGE reranker endpoint accepting `{ model, query, documents, top_n }`.
- Qwen2.5-VL-7B AWQ through vLLM's OpenAI-compatible API.
- Optional MNLI endpoint accepting `{ model, premise, hypotheses }`.
- Optional Redis REST cache; local development uses an in-process TTL cache.

Start Qwen on a GPU host:

```bash
vllm serve Qwen/Qwen2.5-VL-7B-Instruct-AWQ \
  --served-model-name Qwen/Qwen2.5-VL-7B-Instruct-AWQ \
  --enable-prefix-caching
```

## Verification

```bash
npm run typecheck
npm test
npm run eval:rag
npm run build
```

`eval/gold.json` contains a 50-query starter gate and prints Recall@10 plus
p50/p95 retrieval latency. Replace or extend it to at least 200 questions as
the official corpus lands.

## Design notes

The interface follows a neutral ChatGPT-style workspace. CBSE-specific controls,
source snippets, diagrams, and mark allocation remain inside the conversation.
