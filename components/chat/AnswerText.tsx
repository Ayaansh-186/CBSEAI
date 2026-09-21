"use client";

import type { Source } from "@/lib/types";

/**
 * A deliberately small renderer. The model writes answer-sheet prose — short
 * paragraphs, numbered steps, the odd equation — so a full markdown parser
 * would be weight we don't need. Three cases are handled:
 *
 *   1. / 2. / •            → a numbered or bulleted step
 *   an equation-ish line   → set apart, slightly larger, tabular figures
 *   [S1]                   → an inline citation chip
 *
 * If the fine-tune starts emitting tables or LaTeX, swap this for a real
 * parser — nothing else depends on its internals.
 */
export function AnswerText({
  text,
  sources = [],
  onCite,
}: {
  text: string;
  sources?: Source[];
  onCite?: (source: Source) => void;
}) {
  const blocks = hideDanglingMarker(text).split("\n");

  return (
    <div className="answer-body">
      {blocks.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: "var(--rule-gap)" }} />;

        const step = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (step) {
          return (
            <div key={i} className="flex gap-2.5">
              <span
                className="shrink-0 tabular-nums"
                style={{ color: "var(--accent)", fontWeight: 600 }}
              >
                {step[1]}.
              </span>
              <span>{renderInline(step[2], sources, onCite)}</span>
            </div>
          );
        }

        if (/^[-•]\s+/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2.5">
              <span className="shrink-0" style={{ color: "var(--accent)" }}>
                •
              </span>
              <span>{renderInline(trimmed.replace(/^[-•]\s+/, ""), sources, onCite)}</span>
            </div>
          );
        }

        if (isEquation(trimmed)) {
          return (
            <div
              key={i}
              className="my-1 tabular-nums"
              style={{
                fontSize: "16.5px",
                letterSpacing: "0.01em",
                fontWeight: 500,
              }}
            >
              {trimmed}
            </div>
          );
        }

        return <p key={i}>{renderInline(trimmed, sources, onCite)}</p>;
      })}
    </div>
  );
}

/**
 * Mid-stream, a keyword arrives as `**oxid` before it arrives as
 * `**oxidising agent**`. Without this the reader watches raw asterisks appear
 * and then vanish. Drop the opening marker until its partner shows up — the
 * word simply un-highlights itself a beat later.
 */
function hideDanglingMarker(text: string) {
  const markers = text.match(/\*\*/g)?.length ?? 0;
  if (markers % 2 === 0) return text;
  const last = text.lastIndexOf("**");
  return text.slice(0, last) + text.slice(last + 2);
}

function isEquation(line: string) {
  return (
    /[→⇌=]/.test(line) &&
    line.length < 80 &&
    /[₀-₉0-9]/.test(line) &&
    !/[.?!]$/.test(line)
  );
}

/**
 * Two inline forms, split in one pass so they can sit next to each other:
 *   **term**  → keyword, underlined in light blue
 *   [S1]      → citation chip
 *
 * The model decides what's a keyword, not a word list here — what earns the
 * mark depends on the question, so a static glossary would highlight the
 * wrong half of the sentence. See buildSystemPrompt in lib/ai/prompt.ts.
 */
function renderInline(
  text: string,
  sources: Source[],
  onCite?: (s: Source) => void,
) {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\[S\d+\])/g);

  return parts.map((part, i) => {
    const keyword = part.match(/^\*\*([^*\n]+)\*\*$/);
    if (keyword) {
      return (
        <mark key={i} className="keyword">
          {keyword[1]}
        </mark>
      );
    }

    const m = part.match(/^\[S(\d+)\]$/);
    if (!m) return <span key={i}>{part}</span>;
    const source = sources[Number(m[1]) - 1];
    if (!source) return null;
    return (
      <button
        key={i}
        type="button"
        onClick={() => onCite?.(source)}
        title={source.label}
        className="mx-0.5 inline-flex h-[17px] min-w-[17px] items-center justify-center rounded-[5px] px-1 align-[0.15em] text-[10.5px] transition-colors"
        style={{
          background: "var(--accent-soft)",
          color: "var(--accent)",
          fontWeight: 650,
        }}
      >
        {m[1]}
      </button>
    );
  });
}
