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
    meta: { kind: "ncert", chunkType: "ncert_section", subject: "science", chapter: 5, page: 95, year: "2026-27", heading: "Nutrition in plants", officialUrl: "https://ncert.nic.in/textbook.php", inActiveSyllabus: true },
  },
  {
    id: "sci-5-stomata",
    text:
      "Exchange of gases across the leaf surface happens through stomata. Large amounts of water are also lost through these pores, so the plant closes them when it does not need carbon dioxide. The opening and closing is controlled by the swelling and shrinking of the guard cells.",
    meta: { kind: "ncert", chunkType: "ncert_section", subject: "science", chapter: 5, page: 96, year: "2026-27", heading: "Stomata", officialUrl: "https://ncert.nic.in/textbook.php", inActiveSyllabus: true },
  },
  {
    id: "sci-5-pyq-2024",
    text:
      "Board question, 2024: Describe the process of nutrition in Amoeba with the help of a labelled diagram. Three marks were allotted — one for the stages named in order, one for the diagram, one for the labels.",
    meta: { kind: "pyq", chunkType: "question_block", subject: "science", chapter: 5, year: "2026-27", heading: "Nutrition in Amoeba", joinPrefix: "2024|086/1/1|7", officialUrl: "https://cbseacademic.nic.in/", inActiveSyllabus: true },
  },
  {
    id: "ms-2024-086-q7",
    text:
      "Marking scheme for Q7: 1 mark for stages of ingestion, digestion, absorption and egestion in order; 1 mark for a neat Amoeba diagram; 1 mark for labels including pseudopodia, food vacuole and nucleus.",
    meta: { kind: "ms", chunkType: "marking_scheme", subject: "science", chapter: 5, year: "2026-27", heading: "Nutrition in Amoeba", joinPrefix: "2024|086/1/1|7", joinKey: "2024|086/1/1|7|", officialUrl: "https://cbseacademic.nic.in/", inActiveSyllabus: true },
  },
  {
    id: "diag-amoeba-nutrition",
    text:
      "Diagram caption: Amoeba nutrition showing pseudopodia surrounding food, food vacuole inside cytoplasm, nucleus and egestion of undigested residue. Tags: amoeba, nutrition, pseudopodia, food vacuole.",
    meta: { kind: "diagram", chunkType: "diagram", subject: "science", chapter: 5, page: 97, year: "2026-27", heading: "Nutrition in Amoeba", joinPrefix: "2024|086/1/1|7", conceptTags: ["amoeba", "nutrition", "pseudopodia", "food vacuole"], officialUrl: "https://ncert.nic.in/textbook.php", inActiveSyllabus: true },
  },
  {
    id: "sci-11-ohms-law",
    text:
      "Ohm's law states that the potential difference across the ends of a metallic conductor is directly proportional to the current flowing through it, provided its temperature remains the same. The constant of proportionality is the resistance, measured in ohms.",
    meta: { kind: "ncert", chunkType: "ncert_section", subject: "science", chapter: 11, page: 201, year: "2026-27", heading: "Ohm's law", officialUrl: "https://ncert.nic.in/textbook.php", inActiveSyllabus: true },
  },
  {
    id: "sci-11-exemplar-series",
    text:
      "In a series combination the current through every resistor is the same and the total resistance is the sum of the individual resistances. In parallel the potential difference is the same across each resistor and the reciprocals of the resistances add.",
    meta: { kind: "exemplar", chunkType: "exemplar_item", subject: "science", chapter: 11, year: "2026-27", heading: "Combination of resistors", officialUrl: "https://ncert.nic.in/exemplar-problems.php", inActiveSyllabus: true },
  },
  {
    id: "math-4-quadratic",
    text:
      "A quadratic equation ax² + bx + c = 0, a ≠ 0, has real roots when the discriminant b² − 4ac is greater than or equal to zero. The roots are then given by x = (−b ± √(b² − 4ac)) / 2a.",
    meta: { kind: "ncert", chunkType: "ncert_section", subject: "maths", chapter: 4, page: 72, year: "2026-27", heading: "Nature of roots", officialUrl: "https://ncert.nic.in/textbook.php", inActiveSyllabus: true },
  },
  {
    id: "math-4-sqp",
    text:
      "Sample paper marking note: in word problems on quadratic equations, forming the equation correctly carries its own mark, separately from solving it. Write the 'let' statement before anything else.",
    meta: { kind: "sqp", chunkType: "question_block", subject: "maths", chapter: 4, year: "2026-27", heading: "Word problems", joinPrefix: "2026|041/1/1|12", officialUrl: "https://cbseacademic.nic.in/", inActiveSyllabus: true },
  },
  {
    id: "ms-2026-041-q12",
    text:
      "Marking scheme for Q12: 1 mark for a correct 'let' statement; 1 mark for forming the quadratic equation; 1 mark for solving the roots; 1 mark for rejecting the impossible value; 1 mark for the final answer with unit.",
    meta: { kind: "ms", chunkType: "marking_scheme", subject: "maths", chapter: 4, year: "2026-27", heading: "Word problems", joinPrefix: "2026|041/1/1|12", joinKey: "2026|041/1/1|12|", officialUrl: "https://cbseacademic.nic.in/", inActiveSyllabus: true },
  },
  {
    id: "sci-1-balancing",
    text:
      "A balanced chemical equation has an equal number of atoms of each element on both sides. Physical states are written in brackets after the formulae, and conditions such as heat, pressure or a catalyst are written above or below the arrow.",
    meta: { kind: "ncert", chunkType: "ncert_section", subject: "science", chapter: 1, page: 8, year: "2026-27", heading: "Balanced chemical equations", officialUrl: "https://ncert.nic.in/textbook.php", inActiveSyllabus: true },
  },
];
