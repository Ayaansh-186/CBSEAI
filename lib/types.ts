/** Shared shapes for the interface preview. */

export type Grade = 10; // widen to 6 | 7 | 8 | 9 | 10 | 11 | 12 as we expand

export type SubjectId =
  | "science"
  | "maths"
  | "social"
  | "english"
  | "hindi";

export interface Subject {
  id: SubjectId;
  name: string;
  short: string;
  /** Chapters as they appear in the current-year NCERT, in order. */
  chapters: Chapter[];
}

export interface Chapter {
  no: number;
  name: string;
  /** Rough board weightage in marks, used by the plan + graph screens. */
  marks: number;
}

/** Source-card styling retained for the interface components. */
export type SourceKind =
  | "ncert"
  | "exemplar"
  | "pyq"
  | "sqp"
  | "ms"
  | "diagram"
  | "model"
  | "cfpq"
  | "notes";

export interface Source {
  id: string;
  kind: SourceKind;
  chunkType?: string;
  /** e.g. "NCERT Science · Ch 1 · p. 14" */
  label: string;
  /** Verbatim snippet shown in the answer sheet. Keep it short. */
  snippet: string;
  /** Optional content for a preview source card. */
  content?: string;
  officialUrl?: string;
  diagramUrl?: string;
  joinPrefix?: string;
  joinKey?: string;
  inActiveSyllabus?: boolean;
  subject?: SubjectId;
  chapter?: number;
  page?: number;
  pageStart?: number;
  pageEnd?: number;
  /** Academic year the source is pinned to, e.g. "2026-27". */
  year?: string;
  score?: number;
}

/** A single scoring step, mirroring how a CBSE examiner splits marks. */
export interface MarkStep {
  marks: number;
  /** What earns this mark, in the examiner's words. */
  for: string;
}

export type AnswerMode =
  | "answer" // write it the way you'd write it in the board exam
  | "explain" // understand it first
  | "revise" // 30-second recap
  | "drill"; // ask me questions instead

export type Role = "user" | "assistant";

export interface ImagePart {
  type: "image";
  /** Local preview URL. Images are not uploaded. */
  url: string;
  alt?: string;
}

export interface TextPart {
  type: "text";
  text: string;
}

export type ContentPart = TextPart | ImagePart;

export interface Message {
  id: string;
  role: Role;
  content: ContentPart[];
  createdAt: number;
  /** Optional source cards for the interface. */
  sources?: Source[];
  /** Assistant-only. The marking-scheme breakdown shown in the margin rail. */
  steps?: MarkStep[];
  /** Assistant-only. Total marks the answer is written for. */
  marks?: number;
  /** Optional interface notice. */
  notice?: string;
  mode?: AnswerMode;
  /** Set while tokens are still arriving. */
  streaming?: boolean;
  error?: string;
}

/** Context for the interface controls. */
export interface ChatContext {
  grade: Grade;
  subject?: SubjectId;
  chapter?: number;
  mode: AnswerMode;
  /** Marks the question is worth — changes answer length materially. */
  marks?: 1 | 2 | 3 | 5;
}

/** Per-topic mastery, from the student's own answers. Powers /graph. */
export interface TopicMastery {
  subject: SubjectId;
  chapter: number;
  topic: string;
  /** 0–1. Below 0.45 is flagged in examiner red. */
  mastery: number;
  attempts: number;
  lastSeen: number;
  /** Concepts the student keeps dropping marks on. */
  slips?: string[];
}
