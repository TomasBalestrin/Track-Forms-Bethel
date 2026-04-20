"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdatePixel } from "@/hooks/usePixels";

const QualifiedWebhookSchema = z.object({
  qualified_webhook_url: z
    .string()
    .trim()
    .max(1000, "URL deve ter no máximo 1000 caracteres.")
    .url("URL inválida.")
    .or(z.literal("")),
});

type FormValues = z.infer<typeof QualifiedWebhookSchema>;

interface Props {
  pixelId: string;
  initialUrl: string | null;
}

export function QualifiedWebhookForm({ pixelId, initialUrl }: Props) {
  const { toast } = useToast();
  const updateMutation = useUpdatePixel(pixelId);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(QualifiedWebhookSchema),
    mode: "onBlur",
    defaultValues: { qualified_webhook_url: initialUrl ?? "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      await updateMutation.mutateAsync({
        qualified_webhook_url: values.qualified_webhook_url,
      });
      reset(values);
      toast({
        title: values.qualified_webhook_url
          ? "Webhook salvo!"
          : "Webhook removido.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar webhook",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  const submitting = isSubmitting || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
      <Label htmlFor="qualified_webhook_url">
        Webhook para leads qualificados
      </Label>
      <div className="flex items-stretch gap-2">
        <Input
          id="qualified_webhook_url"
          type="url"
          placeholder="https://exemplo.com/webhook"
          className="font-mono text-xs"
          autoComplete="off"
          aria-invalid={errors.qualified_webhook_url ? "true" : "false"}
          aria-describedby={
            errors.qualified_webhook_url
              ? "qualified_webhook_url-error"
              : "qualified_webhook_url-help"
          }
          {...register("qualified_webhook_url")}
        />
        <Button
          type="submit"
          disabled={!isDirty || submitting}
          className="shrink-0"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Salvando
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Salvar
            </>
          )}
        </Button>
      </div>
      {errors.qualified_webhook_url ? (
        <p
          id="qualified_webhook_url-error"
          className="text-xs text-destructive"
        >
          {errors.qualified_webhook_url.message}
        </p>
      ) : (
        <p
          id="qualified_webhook_url-help"
          className="text-xs text-muted-foreground"
        >
          Quando um lead for qualificado, enviamos os dados via POST também para
          esta URL. Deixe em branco para desativar.
        </p>
      )}
    </form>
  );
}
