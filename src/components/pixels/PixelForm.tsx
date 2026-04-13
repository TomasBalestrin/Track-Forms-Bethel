"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCreatePixel } from "@/hooks/usePixels";
import {
  CreatePixelSchema,
  type CreatePixelSchemaInput,
} from "@/lib/validations/pixel";

export function PixelForm() {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreatePixel();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreatePixelSchemaInput>({
    resolver: zodResolver(CreatePixelSchema),
    mode: "onBlur",
    defaultValues: { name: "", pixel_id: "", capi_token: "" },
  });

  async function onSubmit(values: CreatePixelSchemaInput) {
    try {
      const pixel = await createMutation.mutateAsync(values);
      toast({ title: "Pixel criado!" });
      router.push(`/pixels/${pixel.id}`);
      router.refresh();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao criar pixel",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  const submitting = isSubmitting || createMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Ex: Pixel Aula Gratuita"
          autoComplete="off"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name ? (
          <p id="name-error" className="text-xs text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="pixel_id">Pixel ID</Label>
        <Input
          id="pixel_id"
          inputMode="numeric"
          placeholder="Ex: 1234567890123"
          autoComplete="off"
          aria-invalid={errors.pixel_id ? "true" : "false"}
          aria-describedby={errors.pixel_id ? "pixel_id-error" : undefined}
          {...register("pixel_id")}
        />
        {errors.pixel_id ? (
          <p id="pixel_id-error" className="text-xs text-destructive">
            {errors.pixel_id.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="capi_token">CAPI Access Token</Label>
        <textarea
          id="capi_token"
          rows={4}
          placeholder="EAAG..."
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-invalid={errors.capi_token ? "true" : "false"}
          aria-describedby={errors.capi_token ? "capi_token-error" : undefined}
          {...register("capi_token")}
        />
        {errors.capi_token ? (
          <p id="capi_token-error" className="text-xs text-destructive">
            {errors.capi_token.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Criando...
            </>
          ) : (
            "Criar Pixel"
          )}
        </Button>
      </div>
    </form>
  );
}
