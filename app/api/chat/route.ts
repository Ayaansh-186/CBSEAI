import { getChatProvider } from "@/lib/ai/provider";
import { buildContextBlock, buildSystemPrompt, extractMarks } from "@/lib/ai/prompt";
import { verifyAnswer } from "@/lib/ai/verifier";
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
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const { messages, context } = body;
  if (!Array.isArray(messages) || !messages.length || !context ||
      !["answer", "explain", "revise", "drill"].includes(context.mode) ||
      messages.at(-1)?.role !== "user") {
    return Response.json({ error: "A user message and valid chat context are required." }, { status: 400 });
  }

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
        if (!query.trim()) {
          send({ type: "error", message: "Add a text question so I can find the relevant source material." });
          return;
        }
        const route = routeQuery(query);

        // 1. Retrieve. Sources go out first so the UI can show what it's
        //    reading from while the model is still thinking.
        const sources = await retrieve(query, {
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
        if (!sources.length) {
          send({ type: "token", text: "I couldn't find a matching CBSE source in the loaded material. Add the relevant source files before asking me to answer this." });
          send({ type: "done" });
          return;
        }
        send({ type: "sources", sources });

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
              "Mark allocation unavailable because no matching marking scheme was retrieved.",
          });
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
