import { createHash } from "crypto";

/**
 * SHA256 lowercase hex — format required by Facebook CAPI for user_data.em.
 * Email is lowercased + trimmed before hashing.
 */
export function hashEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Builds the `fbc` (Facebook click id) in Facebook's canonical format:
 *   fb.1.{timestamp_ms}.{fbclid}
 * Returns null when the fbclid is missing/empty.
 */
export function buildFbc(
  fbclid: string | null | undefined,
  clickTimeMs: number = Date.now()
): string | null {
  if (!fbclid) return null;
  const trimmed = fbclid.trim();
  if (!trimmed) return null;
  return `fb.1.${clickTimeMs}.${trimmed}`;
}
