import { z } from "zod";

export const QualificationRuleSchema = z.object({
  field_name: z
    .string()
    .trim()
    .min(1, "Nome do campo é obrigatório.")
    .max(100, "Nome do campo deve ter no máximo 100 caracteres."),
  qualified_values: z
    .array(z.string().trim().min(1).max(200))
    .max(100, "Máximo de 100 valores por regra."),
  is_active: z.boolean(),
});

export const SaveRulesSchema = z.object({
  rules: z
    .array(QualificationRuleSchema)
    .max(50, "Máximo de 50 regras por pixel."),
});

export type SaveRulesInput = z.infer<typeof SaveRulesSchema>;
export type QualificationRuleSchemaInput = z.infer<
  typeof QualificationRuleSchema
>;
