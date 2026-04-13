import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  QualificationRule,
  QualificationRuleInput,
} from "@/types/rule";

export class RuleServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "not_found" | "unknown" = "unknown"
  ) {
    super(message);
    this.name = "RuleServiceError";
  }
}

export const ruleService = {
  async getRules(
    supabase: SupabaseClient,
    pixelId: string
  ): Promise<QualificationRule[]> {
    const { data, error } = await supabase
      .from("qualification_rules")
      .select("*")
      .eq("pixel_id", pixelId)
      .order("field_name", { ascending: true });

    if (error) throw new RuleServiceError(error.message);
    return (data ?? []) as QualificationRule[];
  },

  /**
   * Substitui TODAS as regras de um pixel pelo conjunto informado
   * (PRD F4: salvar sobrescreve). Executa delete + insert sequencialmente
   * (sem transação explícita — o Postgres ainda garante atomicidade
   * por requisição em chamadas curtas; em produção considerar RPC).
   */
  async saveRules(
    supabase: SupabaseClient,
    pixelId: string,
    rules: QualificationRuleInput[]
  ): Promise<QualificationRule[]> {
    const { error: deleteErr } = await supabase
      .from("qualification_rules")
      .delete()
      .eq("pixel_id", pixelId);

    if (deleteErr) throw new RuleServiceError(deleteErr.message);

    if (rules.length === 0) return [];

    const payload = rules.map((r) => ({
      pixel_id: pixelId,
      field_name: r.field_name,
      qualified_values: r.qualified_values,
      is_active: r.is_active,
    }));

    const { data, error: insertErr } = await supabase
      .from("qualification_rules")
      .insert(payload)
      .select("*");

    if (insertErr) throw new RuleServiceError(insertErr.message);
    return (data ?? []) as QualificationRule[];
  },
};
