import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../app/api/chat/route";
import { getVectorStore } from "../lib/rag/vectorstore";

const request = () => new Request("http://localhost/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [{ role: "user", content: [{ type: "text", text: "What is a balanced chemical equation?" }] }],
    context: { grade: 10, subject: "science", chapter: 1, mode: "answer" },
  }),
});

test("chat refuses to answer without retrieved sources", async () => {
  const response = await POST(request());
  const body = await response.text();
  assert.match(body, /couldn't find a matching CBSE source/i);
  assert.doesNotMatch(body, /"type":"sources"/);
});

test("chat requires a configured model after retrieval", async () => {
  await getVectorStore().upsert([{
    id: "test-balanced-equation",
    text: "A balanced chemical equation has an equal number of atoms of each element on both sides.",
    meta: {
      kind: "ncert",
      subject: "science",
      chapter: 1,
      chunkType: "ncert_section",
      year: "2026-27",
      inActiveSyllabus: true,
    },
  }]);
  const response = await POST(request());
  const body = await response.text();
  assert.match(body, /"type":"sources"/);
  assert.match(body, /No model is connected yet/);
});
