# Padhle

A CBSE Class 10 tutor that writes answers the way the marking scheme reads them.
This repo is the front end and the seams — the UI is finished, the model and the
corpus are not yet plugged in.

```bash
npm install
cp .env.example .env.local
npm run dev
```

It runs out of the box on `MODEL_PROVIDER=mock`, which streams canned board
answers so every part of the interface — citations, the margin marks, the
highlighter, the typing rhythm — is visible before the fine-tune lands.

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
  rag/retriever.ts      ← ranking and chunking
  rag/vectorstore.ts    ← the store seam
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
MODEL_NAME=padhle/qwen2.5-vl-7b-cbse10
```

`lib/ai/provider.ts` speaks the OpenAI chat-completions protocol, which is what
vLLM, SGLang, Nebius, Together, Fireworks and Ollama all serve. If you host
Qwen2.5-VL-7B any of those ways, nothing in the app changes.

Images are already wired end to end. A photographed question goes up as a data
URL in the `image_url` part shape Qwen2.5-VL expects, and if `VISION_MODEL_NAME`
is set, turns containing an image route to that checkpoint instead — that's
where Llama-3.2-11B-Vision fits.

### What the model has to emit

Two conventions, both parsed:

| The model writes | The app renders |
|---|---|
| `**oxidising agent**` | the keyword, underlined in light-blue highlighter |
| `[S1]` | a citation chip, tap to open the NCERT snippet |
| `MARKS: 3 \| 1 — states the law \| 1 — balanced equation \| 1 — observation` | the marks in the examiner's margin |

The `MARKS:` line is stripped before display, so it never flashes on screen as
text. Put these in the training data and the prompt clauses that ask for them
can be deleted — which is the point of fine-tuning them in.

## Plugging in RAG

`POST /api/ingest` with either raw text or pre-chunked rows:

```bash
curl -X POST localhost:3000/api/ingest -H 'content-type: application/json' -d '{
  "text": "...page text...",
  "meta": { "kind": "ncert", "subject": "science", "chapter": 5, "page": 95 }
}'
```

`kind` is one of `ncert | exemplar | pyq | sqp | cfpq | model | notes`, and it
matters: `lib/rag/retriever.ts` reranks by source priority, so current-year
NCERT outranks everything else regardless of embedding similarity. That
ordering is the product's claim, so it lives in code rather than in the index.

Every chunk is stamped with `NCERT_YEAR` and retrieval hard-filters on it. When
NCERT changes, bump the year, re-ingest, and last year's text can't leak into an
answer even if it's still sitting in the store.

The default store is in-memory and resets on deploy. Before December, implement
`createQdrantStore` in `lib/rag/vectorstore.ts` — the interface above it is all
the app depends on, so it's two fetches.

Check what the model is being fed without generating anything:

```
GET /api/rag/search?q=ohm's+law&subject=science&chapter=11
```

## Still to build

- Auth on `/api/ingest`, and rate limiting on `/api/chat`
- Grading loop — `drill` turns should write attempts; `lib/data/mastery.ts` has
  the decay formula it should feed
- Persistence for transcripts (everything is in memory today)
- Interactive diagrams for Science; the chat only describes them so far
- Hindi and SST corpora — the embedder default (BGE-M3) already handles
  Devanagari, so it's an ingestion job, not a model one

## Design notes

The chat is an answer sheet. Ruled canvas, one red margin line, marks written
outside it the way an examiner writes them. Red means marks and nothing else —
if it appears anywhere as decoration, that's a bug. There is one highlighter, a
light blue, used for the words that earn the mark.

Type is Bricolage Grotesque over Schibsted Grotesk. Tokens live at the top of
`app/globals.css`; `--rule-gap` controls the ruling, the answer line-height and
the margin rail together, so change it there and the whole sheet stays in step.
