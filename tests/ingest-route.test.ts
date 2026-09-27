import assert from "node:assert/strict";
import test from "node:test";

test("ingestion requires a key and makes valid source rows searchable", async () => {
  process.env.INGEST_API_KEY = "local-test-ingest-key";
  const { POST } = await import("../app/api/ingest/route");
  const { retrieve } = await import("../lib/rag/retriever");
  const body = JSON.stringify({ chunks: [{
    id: "test-ncert-balancing",
    text: "A balanced chemical equation contains equal numbers of each element's atoms on both sides.",
    meta: {
      kind: "ncert",
      subject: "science",
      chapter: 1,
      chunkType: "ncert_section",
      officialUrl: "https://ncert.nic.in/textbook.php",
      inActiveSyllabus: true,
      contentSha256: "a".repeat(64),
      language: "en",
    },
  }] });
  const invalid = await POST(new Request("http://localhost/api/ingest", {
    method: "POST", body, headers: { "Content-Type": "application/json" },
  }));
  assert.equal(invalid.status, 401);

  const valid = await POST(new Request("http://localhost/api/ingest", {
    method: "POST", body,
    headers: { "Content-Type": "application/json", Authorization: "Bearer local-test-ingest-key" },
  }));
  assert.equal(valid.status, 200);
  assert.equal((await valid.json()).ingested, 1);
  const sources = await retrieve("balanced chemical equation", { subject: "science", chapter: 1 });
  assert.equal(sources[0]?.id, "test-ncert-balancing");
});
