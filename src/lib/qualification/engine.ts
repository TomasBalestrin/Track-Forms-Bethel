import type { QualificationRule } from "@/types/rule";

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Regras:
 * - Se não há regras ativas, o lead NÃO é qualificado (PRD F3: "aguardando regras").
 * - AND entre regras ativas (o lead precisa passar em todas).
 * - OR entre qualified_values de cada regra (basta uma resposta bater).
 * - Comparação case-insensitive e com trim.
 * - Se a regra aponta para um campo ausente no form_data → falha.
 */
export function evaluateQualification(
  formData: Record<string, unknown>,
  rules: QualificationRule[]
): boolean {
  const active = rules.filter((r) => r.is_active);
  if (active.length === 0) return false;

  return active.every((rule) => {
    const raw = formData[rule.field_name];
    if (typeof raw !== "string") return false;
    const answer = normalize(raw);
    if (!answer) return false;
    return rule.qualified_values.some((v) => normalize(v) === answer);
  });
}
