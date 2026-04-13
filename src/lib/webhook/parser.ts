import type { ParsedWebhookPayload } from "@/types/lead";

/**
 * Campos de tracking que NÃO entram como "pergunta" para as regras
 * de qualificação (PRD F4). Também servem para filtrar o form_data
 * limpo usado pela UI de configuração.
 */
export const TRACKING_FIELDS = [
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "email",
  "submission_id",
] as const;

const EMAIL_KEYS = ["email", "e-mail", "Email", "EMAIL", "E-mail", "E-Mail"];

function firstString(
  obj: Record<string, unknown>,
  keys: readonly string[]
): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return null;
}

function pickString(
  obj: Record<string, unknown>,
  key: string
): string | null {
  const value = obj[key];
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }
  return null;
}

/**
 * Extrai email, fbclid, UTMs e retorna o form_data completo preservado.
 * Aceita qualquer JSON "flat" do Framer. Nunca executa nada — apenas leitura.
 */
export function parseWebhookPayload(
  raw: unknown
): ParsedWebhookPayload {
  const obj: Record<string, unknown> =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  return {
    email: firstString(obj, EMAIL_KEYS),
    fbclid: pickString(obj, "fbclid"),
    utm_source: pickString(obj, "utm_source"),
    utm_medium: pickString(obj, "utm_medium"),
    utm_campaign: pickString(obj, "utm_campaign"),
    utm_content: pickString(obj, "utm_content"),
    utm_term: pickString(obj, "utm_term"),
    form_data: obj,
  };
}

/**
 * Retorna o subconjunto do form_data que pode virar pergunta
 * de qualificação (remove email, utms, fbclid, submission_id).
 */
export function extractQualificationFields(
  formData: Record<string, unknown>
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(formData)) {
    if ((TRACKING_FIELDS as readonly string[]).includes(key)) continue;
    if (typeof value === "string" && value.trim() !== "") {
      out[key] = value.trim();
    }
  }
  return out;
}
