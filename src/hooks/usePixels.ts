"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreatePixelInput,
  Pixel,
  UpdatePixelInput,
} from "@/types/pixel";

const PIXELS_QUERY_KEY = ["pixels"] as const;

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.error === "string") return body.error;
  } catch {
    // ignore
  }
  return "Erro ao processar a requisição.";
}

async function fetchPixels(): Promise<Pixel[]> {
  const res = await fetch("/api/pixels", { cache: "no-store" });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { data: Pixel[] };
  return body.data;
}

async function createPixel(input: CreatePixelInput): Promise<Pixel> {
  const res = await fetch("/api/pixels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { data: Pixel };
  return body.data;
}

async function updatePixel(
  id: string,
  input: UpdatePixelInput
): Promise<Pixel> {
  const res = await fetch(`/api/pixels/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as { data: Pixel };
  return body.data;
}

async function deletePixel(id: string): Promise<void> {
  const res = await fetch(`/api/pixels/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(await parseError(res));
}

export function usePixels() {
  return useQuery({
    queryKey: PIXELS_QUERY_KEY,
    queryFn: fetchPixels,
  });
}

export function useCreatePixel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPixel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PIXELS_QUERY_KEY });
    },
  });
}

export function useUpdatePixel(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdatePixelInput) => updatePixel(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PIXELS_QUERY_KEY });
    },
  });
}

export function useDeletePixel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePixel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PIXELS_QUERY_KEY });
    },
  });
}
