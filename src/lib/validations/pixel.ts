import { z } from "zod";

export const CreatePixelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(100, "Nome deve ter no máximo 100 caracteres."),
  pixel_id: z
    .string()
    .trim()
    .min(1, "Pixel ID é obrigatório.")
    .max(20, "Pixel ID deve ter no máximo 20 caracteres.")
    .regex(/^\d+$/, "Pixel ID deve ser numérico."),
  capi_token: z
    .string()
    .trim()
    .min(1, "CAPI Access Token é obrigatório.")
    .max(500, "CAPI Access Token deve ter no máximo 500 caracteres."),
});

export const UpdatePixelSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório.")
      .max(100, "Nome deve ter no máximo 100 caracteres.")
      .optional(),
    capi_token: z
      .string()
      .trim()
      .min(1, "CAPI Access Token é obrigatório.")
      .max(500, "CAPI Access Token deve ter no máximo 500 caracteres.")
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.capi_token !== undefined,
    { message: "Informe ao menos um campo para atualizar." }
  );

export type CreatePixelSchemaInput = z.infer<typeof CreatePixelSchema>;
export type UpdatePixelSchemaInput = z.infer<typeof UpdatePixelSchema>;
