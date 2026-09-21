"use client";

import { useState } from "react";
import type { Message, Source } from "@/lib/types";
import { AnswerText } from "./AnswerText";
import { Sources } from "./Sources";

/**
 * One assistant turn, laid out as a page of an answer sheet.
 *
 * The left rail is the whole idea: marks sit outside the margin line, in red,
 * the way an examiner writes them. They appear only when the model has
 * actually returned a breakdown, so an empty rail means "not a marked answer"
 * rather than "zero".
 */
export function AnswerSheet({ message }: { message: Message }) {
  const [openSource, setOpenSource] = useState<Source | null>(null);
  const text =
    message.content.find((p) => p.type === "text")?.type === "text"
      ? (message.content.find((p) => p.type === "text") as { text: string }).text
      : "";

  const empty = !text.trim();

  return (
    <article className="relative py-4">
      {/* Margin rail */}
      <div
        className="absolute left-0 top-4 flex flex-col items-end gap-1 pr-2.5"
        style={{ width: "var(--rail)" }}
        aria-hidden={!message.steps?.length}
      >
        {message.marks != null && (
          <span
            className="tabular-nums text-[15px] leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "var(--red)",
            }}
          >
            {message.marks}
            <span className="text-[10px]">m</span>
          </span>
        )}
        {message.steps?.map((step, i) => (
          <span
            key={i}
            title={step.for}
            className="tabular-nums text-[11px] leading-none"
            style={{ color: "var(--red)", opacity: 0.75 }}
          >
            ✓{step.marks}
          </span>
        ))}
      </div>

      {/* Answer */}
      <div style={{ paddingLeft: "calc(var(--rail) + 18px)", paddingRight: "8px" }}>
        {empty && message.streaming && <Thinking />}

        {!empty && (
          <div style={{ fontSize: "15px" }}>
            <AnswerText
              text={text}
              sources={message.sources}
              onCite={setOpenSource}
            />
            {message.streaming && <span className="caret" />}
          </div>
        )}

        {message.error && (
          <p
            className="rounded-lg px-3 py-2 text-[13.5px]"
            style={{ background: "var(--red-soft)", color: "var(--red)" }}
          >
            {message.error}
          </p>
        )}

        {message.steps?.length ? (
          <div
            className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]"
            style={{ color: "var(--text-faint)" }}
          >
            {message.steps.map((step, i) => (
              <span key={i}>
                <span style={{ color: "var(--red)", fontWeight: 600 }}>
                  {step.marks}
                </span>{" "}
                {step.for}
              </span>
            ))}
          </div>
        ) : null}

        {message.sources?.length ? (
          <Sources
            sources={message.sources}
            open={openSource}
            onOpen={setOpenSource}
          />
        ) : null}
      </div>
    </article>
  );
}

/** Shown between "sources found" and "first token". Three dots, no copy —
 *  the sources chips above already say what's happening. */
function Thinking() {
  return (
    <div className="flex items-center gap-1.5 py-1" aria-label="Writing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-1.5 w-1.5 rounded-full"
          style={{
            background: "var(--text-faint)",
            animation: "caret 1.1s ease-in-out infinite",
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}
