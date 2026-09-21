import assert from "node:assert/strict";
import test from "node:test";
import { verifyAnswer } from "../lib/ai/verifier";
import { validateChunks } from "../lib/rag/ingest";
import { routeQuery } from "../lib/rag/router";
import { inferSyllabusScope } from "../lib/rag/syllabus-index";
import type { Chunk, Source } from "../lib/types";

test("routes canonical query types", () => {
  assert.equal(routeQuery("draw a ray diagram"), "diagram");
  assert.equal(routeQuery("show the marking scheme"), "marking");
  assert.equal(routeQuery("solve this numerical"), "numerical");
  assert.equal(routeQuery("2025 PYQ question"), "pyq");
  assert.equal(routeQuery("explain photosynthesis"), "theory");
});

test("infers a narrow syllabus scope", () => {
  assert.deepEqual(inferSyllabusScope("state Ohm's law"), {
    subject: "science",
    chapters: [11],
    outOfSyllabus: false,
  });
});

test("strips invented marks when no marking scheme is present", async () => {
  const sources: Source[] = [{
    id: "ncert-1",
    kind: "ncert",
    chunkType: "ncert_section",
    label: "NCERT",
    snippet: "Supported fact.",
    content: "Supported fact.",
  }];
  const result = await verifyAnswer(
    "Supported fact. [[source:ncert-1]] [1 Mark]\nMARKS: 1 | 1 — fact",
    sources,
    "marking",
  );
  assert.equal(result.marksOk, false);
  assert.doesNotMatch(result.text, /mark/i);
  assert.ok(result.notice);
});

test("rejects citation ids outside context", async () => {
  const result = await verifyAnswer(
    "Claim. [[source:missing]]",
    [],
    "theory",
  );
  assert.equal(result.citationOk, false);
});

test("accepts canonical ingestion metadata", () => {
  const chunks: Chunk[] = [{
    id: "ncert-sci-1",
    text: "Balanced equations conserve atoms.",
    meta: {
      kind: "ncert",
      subject: "science",
      chapter: 1,
      year: "2026-27",
      chunkType: "ncert_section",
      officialUrl: "https://ncert.nic.in/textbook.php",
      inActiveSyllabus: true,
      contentSha256: "a".repeat(64),
      language: "en",
    },
  }];
  assert.deepEqual(validateChunks(chunks), []);
});
