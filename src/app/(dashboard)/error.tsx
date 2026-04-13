"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[dashboard error boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
        aria-hidden="true"
      >
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold">
          Algo deu errado
        </h1>
        <p className="text-sm text-muted-foreground">
          Não conseguimos carregar esta página. Tente novamente ou recarregue o
          dashboard.
        </p>
      </div>
      <Button onClick={reset}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Tentar novamente
      </Button>
    </div>
  );
}
