import { env } from "../config";
import type { Source } from "../types";

export interface NliResult {
  ok: boolean;
  checked: boolean;
  unsupportedClaims: string[];
}

export async function verifyClaims(text: string, sources: Source[]): Promise<NliResult> {
  if (!env.nliBaseUrl || !sources.length) {
    return { ok: true, checked: false, unsupportedClaims: [] };
  }

  const claims = text
    .replace(/\[\[(?:source|diagram):[^\]]+\]\]/g, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((claim) => claim.trim())
    .filter((claim) => claim.length >= 24 && !/^MARKS:/i.test(claim));
  if (!claims.length) return { ok: true, checked: true, unsupportedClaims: [] };

  const res = await fetch(env.nliBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.nliApiKey ? { Authorization: `Bearer ${env.nliApiKey}` } : {}),
    },
    body: JSON.stringify({
      model: env.nliModel,
      premise: sources.map((source) => source.content ?? source.snippet).join("\n\n"),
      hypotheses: claims,
    }),
  });
  if (!res.ok) {
    return { ok: false, checked: true, unsupportedClaims: ["NLI verifier unavailable"] };
  }
  const json = await res.json();
  const rows = json.results ?? json.data ?? [];
  const unsupportedClaims = claims.filter((claim, index) => {
    const row = rows[index] ?? {};
    const label = String(row.label ?? row.prediction ?? "").toLowerCase();
    const score = Number(row.score ?? row.entailment ?? 0);
    return !label.includes("entail") || score < env.nliThreshold;
  });
  return { ok: unsupportedClaims.length === 0, checked: true, unsupportedClaims };
}
