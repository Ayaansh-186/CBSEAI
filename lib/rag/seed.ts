import type { Chunk } from "../types";

/**
 * A handful of hand-written chunks so the citation UI has something real to
 * render before the NCERT ingestion pipeline runs. Paraphrased, not verbatim.
 *
 * Replace wholesale — `POST /api/ingest` writes into the same store.
 */
export const SEED_CHUNKS: Chunk[] = [
  {
    id: "sci-5-photosynthesis",
    text:
      "Photosynthesis takes place in three events: absorption of light energy by chlorophyll, conversion of that light energy into chemical energy along with the splitting of water into hydrogen and oxygen, and reduction of carbon dioxide to carbohydrates. These events need not take place one immediately after the other.",
    meta: { kind: "ncert", subject: "science", chapter: 5, page: 95, year: "2026-27", heading: "Nutrition in plants" },
  },
  {
    id: "sci-5-stomata",
    text:
      "Exchange of gases across the leaf surface happens through stomata. Large amounts of water are also lost through these pores, so the plant closes them when it does not need carbon dioxide. The opening and closing is controlled by the swelling and shrinking of the guard cells.",
    meta: { kind: "ncert", subject: "science", chapter: 5, page: 96, year: "2026-27", heading: "Stomata" },
  },
  {
    id: "sci-5-pyq-2024",
    text:
      "Board question, 2024: Describe the process of nutrition in Amoeba with the help of a labelled diagram. Three marks were allotted — one for the stages named in order, one for the diagram, one for the labels.",
    meta: { kind: "pyq", subject: "science", chapter: 5, year: "2026-27", heading: "Nutrition in Amoeba" },
  },
  {
    id: "sci-11-ohms-law",
    text:
      "Ohm's law states that the potential difference across the ends of a metallic conductor is directly proportional to the current flowing through it, provided its temperature remains the same. The constant of proportionality is the resistance, measured in ohms.",
    meta: { kind: "ncert", subject: "science", chapter: 11, page: 201, year: "2026-27", heading: "Ohm's law" },
  },
  {
    id: "sci-11-exemplar-series",
    text:
      "In a series combination the current through every resistor is the same and the total resistance is the sum of the individual resistances. In parallel the potential difference is the same across each resistor and the reciprocals of the resistances add.",
    meta: { kind: "exemplar", subject: "science", chapter: 11, year: "2026-27", heading: "Combination of resistors" },
  },
  {
    id: "math-4-quadratic",
    text:
      "A quadratic equation ax² + bx + c = 0, a ≠ 0, has real roots when the discriminant b² − 4ac is greater than or equal to zero. The roots are then given by x = (−b ± √(b² − 4ac)) / 2a.",
    meta: { kind: "ncert", subject: "maths", chapter: 4, page: 72, year: "2026-27", heading: "Nature of roots" },
  },
  {
    id: "math-4-sqp",
    text:
      "Sample paper marking note: in word problems on quadratic equations, forming the equation correctly carries its own mark, separately from solving it. Write the 'let' statement before anything else.",
    meta: { kind: "sqp", subject: "maths", chapter: 4, year: "2026-27", heading: "Word problems" },
  },
  {
    id: "sci-1-balancing",
    text:
      "A balanced chemical equation has an equal number of atoms of each element on both sides. Physical states are written in brackets after the formulae, and conditions such as heat, pressure or a catalyst are written above or below the arrow.",
    meta: { kind: "ncert", subject: "science", chapter: 1, page: 8, year: "2026-27", heading: "Balanced chemical equations" },
  },
];
