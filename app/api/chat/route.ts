import { getChatProvider } from "@/lib/ai/provider";
import { buildContextBlock, buildSystemPrompt, extractMarks } from "@/lib/ai/prompt";
import { retrieve } from "@/lib/rag/retriever";
import type { ChatEvent, ChatRequestBody } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Retrieve → prompt → stream. The client consumes the SSE frames defined by
 * ChatEvent, so adding a new signal (say, a suggested diagram) means adding one
 * variant there and one case in the reducer — not reshaping this route.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequestBody;
  const { messages, context } = body;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: ChatEvent) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      try {
        const last = messages.at(-1);
        const query =
          last?.content
            .filter((p) => p.type === "text")
            .map((p) => (p as { text: string }).text)
            .join(" ") ?? "";
        const hasImages = Boolean(last?.content.some((p) => p.type === "image"));

        // 1. Retrieve. Sources go out first so the UI can show what it's
        //    reading from while the model is still thinking.
        let sources: Awaited<ReturnType<typeof retrieve>> = [];
        if (query.trim()) {
          try {
            sources = await retrieve(query, {
              subject: context.subject,
              chapter: context.chapter,
              topK: 4,
            });
            if (sources.length) send({ type: "sources", sources });
          } catch (err) {
            // A retrieval failure shouldn't kill the answer — the model still
            // knows the syllabus. It just can't cite.
            console.error("retrieval failed", err);
          }
        }

        // 2. Prompt.
        const system = [buildSystemPrompt(context), buildContextBlock(sources)]
          .filter(Boolean)
          .join("\n\n");

        // 3. Stream, holding back the trailing MARKS: line so it never flashes
        //    on screen as text — it belongs in the margin rail.
        const provider = getChatProvider();
        let full = "";
        let emitted = 0;

        for await (const delta of provider.stream({
          system,
          messages,
          signal: req.signal,
          hasImages,
        })) {
          full += delta;
          const marksAt = full.search(/\n?MARKS:\s*\d/i);
          const safeUpTo = marksAt === -1 ? full.length : marksAt;
          if (safeUpTo > emitted) {
            send({ type: "token", text: full.slice(emitted, safeUpTo) });
            emitted = safeUpTo;
          }
        }

        const { steps, marks } = extractMarks(full);
        if (steps?.length) send({ type: "steps", steps, marks });

        send({ type: "done" });
      } catch (err) {
        send({
          type: "error",
          message:
            err instanceof Error ? err.message : "The model didn't respond.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
