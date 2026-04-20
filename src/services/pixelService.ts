import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreatePixelInput,
  Pixel,
  UpdatePixelInput,
} from "@/types/pixel";

export class PixelServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "not_found"
      | "forbidden"
      | "conflict"
      | "unknown" = "unknown"
  ) {
    super(message);
    this.name = "PixelServiceError";
  }
}

const MAX_PIXELS_PER_USER = 10;

function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === "23505";
}

export const pixelService = {
  async list(supabase: SupabaseClient, userId: string): Promise<Pixel[]> {
    const { data, error } = await supabase
      .from("pixels")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new PixelServiceError(error.message);
    }
    return (data ?? []) as Pixel[];
  },

  async create(
    supabase: SupabaseClient,
    userId: string,
    input: CreatePixelInput
  ): Promise<Pixel> {
    const { count, error: countError } = await supabase
      .from("pixels")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw new PixelServiceError(countError.message);
    }
    if ((count ?? 0) >= MAX_PIXELS_PER_USER) {
      throw new PixelServiceError(
        `Limite de ${MAX_PIXELS_PER_USER} pixels atingido.`,
        "conflict"
      );
    }

    const { data, error } = await supabase
      .from("pixels")
      .insert({
        user_id: userId,
        name: input.name,
        pixel_id: input.pixel_id,
        capi_token: input.capi_token,
      })
      .select("*")
      .single();

    if (error) {
      if (isUniqueViolation(error)) {
        throw new PixelServiceError(
          "Já existe um pixel com esse identificador.",
          "conflict"
        );
      }
      throw new PixelServiceError(error.message);
    }
    return data as Pixel;
  },

  async getById(
    supabase: SupabaseClient,
    userId: string,
    id: string
  ): Promise<Pixel> {
    const { data, error } = await supabase
      .from("pixels")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      throw new PixelServiceError(error.message);
    }
    if (!data) {
      throw new PixelServiceError("Pixel não encontrado.", "not_found");
    }
    return data as Pixel;
  },

  async update(
    supabase: SupabaseClient,
    userId: string,
    id: string,
    input: UpdatePixelInput
  ): Promise<Pixel> {
    const payload: UpdatePixelInput = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.capi_token !== undefined) payload.capi_token = input.capi_token;
    if (input.qualified_webhook_url !== undefined) {
      payload.qualified_webhook_url =
        input.qualified_webhook_url === "" ? null : input.qualified_webhook_url;
    }

    const { data, error } = await supabase
      .from("pixels")
      .update(payload)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new PixelServiceError(error.message);
    }
    if (!data) {
      throw new PixelServiceError("Pixel não encontrado.", "not_found");
    }
    return data as Pixel;
  },

  async delete(
    supabase: SupabaseClient,
    userId: string,
    id: string
  ): Promise<void> {
    const { data, error } = await supabase
      .from("pixels")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();

    if (error) {
      throw new PixelServiceError(error.message);
    }
    if (!data) {
      throw new PixelServiceError("Pixel não encontrado.", "not_found");
    }
  },
};
