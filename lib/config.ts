import type { AnswerMode } from "./types";

export const APP = {
  name: "Padhle",
  tagline: "UI preview",
  grade: 10 as const,
  board: "CBSE",
};

export const MODES: { id: AnswerMode; label: string; hint: string }[] = [
  { id: "answer", label: "Board answer", hint: "Board answer layout" },
  { id: "explain", label: "Explain", hint: "Explanation layout" },
  { id: "revise", label: "Revise", hint: "Revision layout" },
  { id: "drill", label: "Ask me", hint: "Practice layout" },
];

export const MARK_OPTIONS = [1, 2, 3, 5] as const;
