"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

import { PixelCard } from "@/components/pixels/PixelCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePixels } from "@/hooks/usePixels";

export function PixelsGrid() {
  const { data, isLoading, isError, error } = usePixels();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {error instanceof Error ? error.message : "Erro ao carregar pixels."}
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed py-16 text-center">
        <p className="max-w-sm text-sm text-muted-foreground">
          Nenhum pixel cadastrado ainda. Crie seu primeiro pixel para começar a
          receber leads.
        </p>
        <Button asChild>
          <Link href="/pixels/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Criar primeiro pixel
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((pixel) => (
        <PixelCard key={pixel.id} pixel={pixel} />
      ))}
    </div>
  );
}
