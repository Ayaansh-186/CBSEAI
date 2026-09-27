import type { Chunk, SourceKind, SubjectId } from "../types";

const KINDS = new Set<SourceKind>([
  "ncert",
  "exemplar",
  "pyq",
  "sqp",
  "ms",
  "diagram",
  "model",
  "cfpq",
  "notes",
]);
const SUBJECTS = new Set<SubjectId>(["science", "maths", "social", "english", "hindi"]);

export function validateChunks(chunks: Chunk[]) {
  const errors: string[] = [];

  chunks.forEach((chunk, i) => {
    const at = chunk.id || `row ${i + 1}`;
    if (!chunk.id) errors.push(`${at}: id is required`);
    if (!chunk.text?.trim()) errors.push(`${at}: text is required`);
    if (!chunk.meta) errors.push(`${at}: meta is required`);
    if (chunk.meta && !KINDS.has(chunk.meta.kind)) errors.push(`${at}: meta.kind is invalid`);
    if (chunk.meta && !SUBJECTS.has(chunk.meta.subject)) errors.push(`${at}: meta.subject is invalid`);
    if (chunk.meta && !Number.isFinite(chunk.meta.chapter)) errors.push(`${at}: meta.chapter is required`);
    if (chunk.meta && !chunk.meta.chunkType) errors.push(`${at}: meta.chunkType is required`);
    if (chunk.meta && !chunk.meta.officialUrl) errors.push(`${at}: meta.officialUrl is required`);
    if (chunk.meta && typeof chunk.meta.inActiveSyllabus !== "boolean") {
      errors.push(`${at}: meta.inActiveSyllabus must be true or false`);
    }
    if (chunk.meta && !/^[a-f0-9]{64}$/i.test(chunk.meta.contentSha256 ?? "")) {
      errors.push(`${at}: meta.contentSha256 must be a SHA-256 hex digest`);
    }
    if (chunk.meta && !chunk.meta.language) errors.push(`${at}: meta.language is required`);
    if (chunk.meta?.kind === "ms" && !chunk.meta.joinPrefix) {
      errors.push(`${at}: marking_scheme chunks need meta.joinPrefix`);
    }
    if ((chunk.meta?.kind === "pyq" || chunk.meta?.kind === "sqp") && !chunk.meta.joinPrefix) {
      errors.push(`${at}: question chunks need meta.joinPrefix`);
    }
    if (chunk.meta?.kind === "diagram" && chunk.meta.chunkType !== "diagram") {
      errors.push(`${at}: diagram chunks should use meta.chunkType="diagram"`);
    }
    if (chunk.meta?.kind === "diagram" && !chunk.meta.conceptTags?.length) {
      errors.push(`${at}: diagram chunks need meta.conceptTags`);
    }
    if (["question_part", "ncert_atom"].includes(chunk.meta?.chunkType ?? "") && !chunk.meta?.parentId) {
      errors.push(`${at}: child chunks need meta.parentId`);
    }
    if (chunk.meta?.officialUrl && !isOfficialUrl(chunk.meta.officialUrl)) {
      errors.push(`${at}: officialUrl must be from NCERT, ePathshala, or CBSE Academic`);
    }
  });

  return errors;
}

function isOfficialUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    return ["ncert.nic.in", "epathshala.nic.in", "cbseacademic.nic.in"]
      .some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}
