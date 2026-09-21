# CBSEAI Data Contract

Drop extracted rows into `POST /api/ingest` as pre-chunked records whenever possible.
The app stamps `meta.year` from `NCERT_YEAR`, validates metadata, embeds the text,
and writes dense and sparse vectors to the active store. Send
`Authorization: Bearer <INGEST_API_KEY>`.

```json
{
  "chunks": [
    {
      "id": "ncert_sci_ch5_s51_p95",
      "text": "Short extractive text used for retrieval and citation.",
      "meta": {
        "kind": "ncert",
        "chunkType": "ncert_section",
        "subject": "science",
        "chapter": 5,
        "page": 95,
        "pageStart": 95,
        "pageEnd": 96,
        "heading": "Nutrition in plants",
        "extractiveQuote": "Short verbatim quote for the source card.",
        "officialUrl": "https://ncert.nic.in/textbook.php",
        "inActiveSyllabus": true,
        "contentSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "ncertEdition": "2025",
        "language": "en"
      }
    }
  ]
}
```

## Required fields

- `id`: stable chunk id.
- `text`: extractive text, caption text, question block, or marking scheme text.
- `meta.kind`: `ncert`, `exemplar`, `pyq`, `sqp`, `ms`, `diagram`, `model`, `cfpq`, or `notes`.
- `meta.subject`: `science`, `maths`, `social`, `english`, or `hindi`.
- `meta.chapter`: NCERT chapter number.
- `meta.chunkType`: canonical parent, child, marking scheme, or diagram type.
- `meta.officialUrl`: allowlisted official source URL.
- `meta.contentSha256`: SHA-256 of the immutable raw PDF.
- `meta.language`: normally `en` or `hi`.
- `meta.inActiveSyllabus`: explicit boolean, never inferred during retrieval.

## Official Source Policy

`meta.officialUrl` must start with one of:

- `https://ncert.nic.in`
- `https://epathshala.nic.in`
- `https://cbseacademic.nic.in`

## Exam Joins

Question chunks and marking-scheme chunks need `joinPrefix`.
Child chunks also need `parentId`; retrieving a child returns its complete
parent. Diagram rows need vocabulary-gated `conceptTags`, and their crop must be
stored as `data/diagrams/<chunk-id>.webp` (or under `DIAGRAM_DIR`).

```json
{
  "id": "ms_2025_045_q3b",
  "text": "1 mark for correct reason; 1 mark for labelled equation.",
  "meta": {
    "kind": "ms",
    "chunkType": "marking_scheme",
    "subject": "science",
    "chapter": 1,
    "joinPrefix": "2025|045/1/1|3",
    "joinKey": "2025|045/1/1|3|b",
    "officialUrl": "https://cbseacademic.nic.in",
    "inActiveSyllabus": true,
    "contentSha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "language": "en"
  }
}
```

## Local Checks

- `GET /api/rag/status` shows active store and chunk count.
- `GET /api/rag/search?q=ohm's+law&subject=science&chapter=11` previews retrieval.
- `POST /api/ingest` validates chunks before storing.
