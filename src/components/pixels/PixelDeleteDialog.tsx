"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useDeletePixel } from "@/hooks/usePixels";
import type { Pixel } from "@/types/pixel";

interface PixelDeleteDialogProps {
  pixel: Pixel;
}

export function PixelDeleteDialog({ pixel }: PixelDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const deleteMutation = useDeletePixel();

  async function handleConfirm() {
    try {
      await deleteMutation.mutateAsync(pixel.id);
      toast({ title: "Pixel deletado." });
      setOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar pixel",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Deletar pixel ${pixel.name}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Deletar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar pixel?</AlertDialogTitle>
          <AlertDialogDescription>
            Isto removerá <strong>{pixel.name}</strong> e todos os leads e
            regras associados. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Deletando...
              </>
            ) : (
              "Deletar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
