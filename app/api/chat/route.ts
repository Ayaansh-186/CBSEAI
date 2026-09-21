import { getChatProvider } from "@/lib/ai/provider";
import { buildContextBlock, buildSystemPrompt, extractMarks } from "@/lib/ai/prompt";
import { verifyAnswer } from "@/lib/ai/verifier";
import { answerCacheKey, getCachedAnswer, setCachedAnswer } from "@/lib/rag/cache";
import { retrieve } from "@/lib/rag/retriever";
import { isExamStyleRoute, routeQuery } from "@/lib/rag/router";
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
        const route = routeQuery(query);
        const cacheKey = answerCacheKey({
          query,
          subject: context.subject,
          chapter: context.chapter,
          mode: context.mode,
          marks: context.marks,
        });

        if (query.trim() && !hasImages) {
          const cached = await getCachedAnswer(cacheKey).catch(() => null);
          if (cached) {
            if (cached.sources.length) send({ type: "sources", sources: cached.sources });
            if (cached.text) send({ type: "token", text: cached.text });
            if (cached.steps?.length) send({ type: "steps", steps: cached.steps, marks: cached.marks });
            if (cached.notice) send({ type: "notice", message: cached.notice });
            send({ type: "done" });
            return;
          }
        }

        // 1. Retrieve. Sources go out first so the UI can show what it's
        //    reading from while the model is still thinking.
        let sources: Awaited<ReturnType<typeof retrieve>> = [];
        if (query.trim()) {
          try {
            sources = await retrieve(query, {
              subject: context.subject,
              chapter: context.chapter,
              kinds:
                route === "diagram"
                  ? ["ncert", "diagram", "ms"]
                  : route === "marking" || route === "pyq"
                    ? ["ncert", "pyq", "sqp", "ms", "diagram"]
                    : undefined,
              route,
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
        const hasMarkingScheme = sources.some(
          (s) => s.kind === "ms" || s.chunkType === "marking_scheme",
        );
        const examStyle = context.mode === "answer" && isExamStyleRoute(route);

        const system = [buildSystemPrompt(context, sources), buildContextBlock(sources)]
          .filter(Boolean)
          .join("\n\n");

        // 3. Generate into a short server-side buffer. Structural verification
        //    happens before anything reaches the answer sheet, so an invalid
        //    citation or invented mark can never flash on screen.
        const provider = getChatProvider();
        const generate = async (prompt: string) => {
          let text = "";
          for await (const delta of provider.stream({
            system: prompt,
            messages,
            signal: req.signal,
            hasImages,
          })) {
            text += delta;
          }
          return text;
        };

        let full = await generate(system);
        let verified = await verifyAnswer(full, sources, route);
        if (!verified.citationOk || !verified.nliOk) {
          full = await generate(
            `${system}\n\nRETRY: The previous draft failed grounding verification. Regenerate once using only claims supported by CONTEXT and only the exact ids shown above.`,
          );
          verified = await verifyAnswer(full, sources, route);
        }

        if (!verified.citationOk || !verified.nliOk) {
          verified = {
            ...verified,
            text: "The requested topic falls outside the retrieved CBSE context.",
          };
        }

        const { text: answerText, steps, marks } = extractMarks(verified.text);
        if (answerText) send({ type: "token", text: answerText });
        if (hasMarkingScheme && steps?.length) {
          send({ type: "steps", steps, marks });
        } else if (verified.notice || (!hasMarkingScheme && examStyle)) {
          send({
            type: "notice",
            message:
              verified.notice ??
              "Verified NCERT theory. Mark allocation unavailable for this query.",
          });
        }

        if (query.trim() && !hasImages) {
          await setCachedAnswer(cacheKey, {
            text: answerText,
            sources,
            steps,
            marks,
            notice:
              verified.notice ??
              (!hasMarkingScheme && examStyle
                ? "Verified NCERT theory. Mark allocation unavailable for this query."
                : undefined),
          }).catch(() => undefined);
        }

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
