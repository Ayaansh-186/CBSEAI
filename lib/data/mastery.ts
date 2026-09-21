import type { TopicMastery } from "../types";

/**
 * PLACEHOLDER DATA.
 *
 * Mastery is meant to be derived, not stored by hand: every `drill` turn
 * produces a graded attempt, and mastery is that attempt history decayed over
 * time. When the grading loop exists, replace this export with a query and the
 * two screens that read it need no changes.
 *
 *   mastery = Σ (correct · e^(−Δdays / 21)) / Σ (attempts · e^(−Δdays / 21))
 *
 * Anything under 0.45 is shown in examiner red.
 */
export const MASTERY: TopicMastery[] = [
  { subject: "science", chapter: 11, topic: "Series vs parallel resistance", mastery: 0.28, attempts: 9, lastSeen: 3, slips: ["Adds reciprocals in series", "Drops the unit"] },
  { subject: "science", chapter: 4, topic: "Naming carbon compounds", mastery: 0.34, attempts: 12, lastSeen: 1, slips: ["Suffix before the functional group"] },
  { subject: "maths", chapter: 9, topic: "Angle of depression problems", mastery: 0.39, attempts: 7, lastSeen: 5, slips: ["Marks the angle at the wrong vertex"] },
  { subject: "science", chapter: 9, topic: "Sign convention in mirrors", mastery: 0.44, attempts: 14, lastSeen: 2, slips: ["Positive u for a real object"] },
  { subject: "maths", chapter: 6, topic: "Similarity criteria", mastery: 0.52, attempts: 8, lastSeen: 6 },
  { subject: "social", chapter: 2, topic: "Civil Disobedience — dates", mastery: 0.58, attempts: 5, lastSeen: 9 },
  { subject: "science", chapter: 5, topic: "Human digestive system labels", mastery: 0.66, attempts: 11, lastSeen: 2 },
  { subject: "maths", chapter: 13, topic: "Mean by step-deviation", mastery: 0.71, attempts: 6, lastSeen: 4 },
  { subject: "science", chapter: 1, topic: "Balancing equations", mastery: 0.78, attempts: 15, lastSeen: 1 },
  { subject: "maths", chapter: 4, topic: "Nature of roots", mastery: 0.84, attempts: 10, lastSeen: 3 },
  { subject: "social", chapter: 20, topic: "Formal vs informal credit", mastery: 0.88, attempts: 4, lastSeen: 7 },
  { subject: "science", chapter: 2, topic: "pH scale", mastery: 0.91, attempts: 9, lastSeen: 5 },
];

/** Board exam start. Drives the countdown on the plan screen. */
export const BOARD_START = new Date("2027-02-15T00:00:00+05:30");

export function daysUntilBoards(from = new Date()) {
  return Math.max(
    0,
    Math.ceil((BOARD_START.getTime() - from.getTime()) / 86_400_000),
  );
}
