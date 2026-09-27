import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config";

export function signedDiagramUrl(id: string) {
  if (!env.diagramSigningSecret || !/^[A-Za-z0-9_-]+$/.test(id)) return undefined;
  const expires = Math.floor(Date.now() / 1000) + env.diagramUrlTtlSeconds;
  const signature = sign(id, expires);
  return `/api/diagram/${encodeURIComponent(id)}?expires=${expires}&signature=${signature}`;
}

export function verifyDiagramSignature(id: string, expires: number, signature: string) {
  if (!env.diagramSigningSecret || expires < Math.floor(Date.now() / 1000)) return false;
  const expected = sign(id, expires);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function sign(id: string, expires: number) {
  return createHmac("sha256", env.diagramSigningSecret)
    .update(`${id}:${expires}`)
    .digest("base64url");
}
