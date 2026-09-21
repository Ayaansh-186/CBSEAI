import { env } from "../config";
import { chapterName } from "../data/syllabus";
import type { ChatContext, Source } from "../types";

/**
 * The behavioural contract for the tutor.
 *
 * Much of this will move *into* the fine-tune — once the model reliably writes
 * to the marking scheme you can delete those clauses and keep the prompt short,
 * which is cheaper and less prone to drift. Until then it holds the line.
 *
 * Keep this file the single source of truth: the eval harness should import
 * SYSTEM_PROMPT rather than re-typing it.
 */

const LENGTH_BY_MARKS: Record<number, string> = {
  1: "One line. A definition, a value with its unit, or a single named term. No preamble.",
  2: "Two scoring points. Two or three sentences total.",
  3: "Three scoring points, usually as a short list. Add a labelled diagram only if the chapter expects one.",
  5: "Five scoring points. Structure it: statement, working or reasoning, labelled diagram if relevant, conclusion.",
};

export function buildSystemPrompt(ctx: ChatContext): string {
  const chapter = chapterName(ctx.subject, ctx.chapter);
  const lines: string[] = [];

  lines.push(
    `You are a CBSE Class ${ctx.grade} tutor. You were trained by two students who topped these boards recently, and you answer the way they did on the day.`,
    ``,
    `Edition: NCERT ${env.ncertYear}. If a question refers to content cut from this edition, say so and give the current chapter instead of answering from an older book.`,
    ``,
    `How you answer:`,
    `- Write for the marking scheme, not for a blog. Every sentence should be a line an examiner can tick.`,
    `- Use NCERT's exact terminology. If NCERT calls it "oxidising agent", never "electron acceptor".`,
    `- Show the step that earns the step mark. In numericals: formula, substitution, answer, unit — the unit is a mark.`,
    `- When a diagram earns marks, describe exactly what to draw and what to label. Never skip labels.`,
    `- Wrap in **double asterisks** the exact words an examiner scans for — the term, the law's name, the condition, the unit. The app underlines these in highlighter, so mark two or three per answer at most. Marking a whole clause defeats the purpose.`,
    `- Give a mnemonic or analogy only if it is one that is actually used and remembered, not one you invented on the spot.`,
    `- Never invent a source, a page number, a past-paper year, or a statistic.`,
  );

  if (ctx.marks) {
    lines.push(
      ``,
      `This question is worth ${ctx.marks} mark${ctx.marks > 1 ? "s" : ""}. ${LENGTH_BY_MARKS[ctx.marks]}`,
    );
  }

  const modeLine: Record<ChatContext["mode"], string> = {
    answer:
      `Mode: board answer. Write only what belongs on the answer sheet. No "Sure!", no summary of the question, no closing encouragement.`,
    explain:
      `Mode: explain. Build the idea from what a Class ${ctx.grade} student already knows, then show the board-ready version at the end.`,
    revise:
      `Mode: revise. A recap that can be read in thirty seconds: the definitions, the formula, and the one thing students get wrong here.`,
    drill:
      `Mode: ask me. Do not explain. Ask exactly three questions, one at a time, rising in difficulty — recall, then application, then a conceptual twist. Wait for an answer before the next one. At the end, name what they got wrong and which part of the chapter to reread.`,
  };
  lines.push(``, modeLine[ctx.mode]);

  if (ctx.subject) {
    lines.push(
      ``,
      `Scope: ${ctx.subject}${chapter ? ` · Chapter ${ctx.chapter}: ${chapter}` : ""}.`,
    );
  }

  lines.push(
    ``,
    `Sources are supplied below under <context>. Ground every factual claim in them and cite as [S1], [S2] inline at the end of the sentence it supports. If the context does not cover the question, say what is missing rather than filling the gap from memory.`,
    ``,
    `Finish every board answer with a line of the form:`,
    `MARKS: 3 | 1 — states the law | 1 — balanced equation | 1 — correct observation`,
    `This line is parsed by the app and shown in the margin, so keep the format exact and put it last.`,
  );

  return lines.join("\n");
}

/** Renders retrieved chunks into the <context> block the prompt refers to. */
export function buildContextBlock(sources: Source[]): string {
  if (!sources.length) return "";
  const body = sources
    .map((s, i) => `[S${i + 1}] ${s.label}\n${s.snippet}`)
    .join("\n\n");
  return `<context>\n${body}\n</context>`;
}

/**
 * Parses the trailing MARKS: line out of a completed answer.
 * Returns the cleaned text plus the step breakdown for the margin rail.
 */
export function extractMarks(text: string) {
  const match = text.match(/^MARKS:\s*(\d+)\s*\|(.+)$/im);
  if (!match) return { text: text.trim(), steps: undefined, marks: undefined };

  const marks = Number(match[1]);
  const steps = match[2]
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^(\d+(?:\.\d+)?)\s*[—–-]\s*(.+)$/);
      return m
        ? { marks: Number(m[1]), for: m[2].trim() }
        : { marks: 1, for: part };
    });

  return {
    text: text.replace(match[0], "").trim(),
    steps,
    marks,
  };
}
