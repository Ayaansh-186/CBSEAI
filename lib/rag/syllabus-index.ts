import { SUBJECTS } from "../data/syllabus";
import type { SubjectId } from "../types";

const ALIASES: Partial<Record<SubjectId, Record<number, string[]>>> = {
  science: {
    1: ["chemical reaction", "equation", "oxidation", "reduction", "corrosion"],
    2: ["acid", "base", "salt", "ph", "indicator"],
    3: ["metals", "non-metals", "reactivity", "ionic compound"],
    5: ["life process", "nutrition", "photosynthesis", "respiration", "amoeba", "stomata", "leaf", "pores", "guard cells", "water loss"],
    6: ["control", "coordination", "neuron", "hormone", "reflex"],
    10: ["light", "reflection", "refraction", "mirror", "lens", "ray diagram"],
    11: ["electricity", "ohm", "resistance", "current", "voltage", "circuit"],
    12: ["magnetic", "electromagnet", "motor", "generator"],
  },
  maths: {
    1: ["real number", "euclid", "hcf", "lcm"],
    2: ["polynomial", "zeroes"],
    3: ["linear equation", "two variables"],
    4: ["quadratic", "discriminant", "roots"],
    5: ["arithmetic progression", "ap"],
    8: ["trigonometry", "sine", "cosine", "tangent"],
    12: ["area", "circle", "sector", "segment"],
    14: ["probability"],
  },
};

export function inferSyllabusScope(query: string, preferredSubject?: SubjectId) {
  if (/\b(?:removed|deleted|out[- ]of[- ]syllabus|blast furnace|metallurgy)\b/i.test(query)) {
    return { subject: preferredSubject, chapters: undefined, outOfSyllabus: true };
  }
  const queryTerms = new Set(tokens(query));
  const candidates = SUBJECTS
    .filter((subject) => !preferredSubject || subject.id === preferredSubject)
    .flatMap((subject) =>
      subject.chapters.map((chapter) => {
        const vocabulary = [
          chapter.name,
          ...(ALIASES[subject.id]?.[chapter.no] ?? []),
        ].flatMap(tokens);
        const score = vocabulary.reduce(
          (total, token) => total + (queryTerms.has(token) ? Math.max(1, token.length / 5) : 0),
          0,
        );
        return { subject: subject.id, chapter: chapter.no, score };
      }),
    )
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) return { subject: preferredSubject, chapters: undefined, outOfSyllabus: false };
  const subject = candidates[0].subject;
  const chapters = candidates
    .filter((candidate) => candidate.subject === subject)
    .slice(0, 3)
    .map((candidate) => candidate.chapter);
  return { subject, chapters, outOfSyllabus: false };
}

function tokens(text: string) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

const STOP_WORDS = new Set([
  "about", "and", "are", "chapter", "compare", "current", "deleted",
  "describe", "does", "explain", "for", "from", "give", "how", "into",
  "not", "old", "out", "should", "show", "the", "through", "using", "what",
  "when", "where", "which", "why", "with", "write",
]);
