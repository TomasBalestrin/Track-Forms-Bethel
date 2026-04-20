"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ExportFormat = "csv" | "xlsx";

interface ExportLeadsButtonProps {
  pixelId: string;
  format: ExportFormat;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: "CSV",
  xlsx: "XLSX",
};

function filenameFromContentDisposition(
  header: string | null,
  fallback: string
): string {
  if (!header) return fallback;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match ? decodeURIComponent(match[1]) : fallback;
}

export function ExportLeadsButton({
  pixelId,
  format,
}: ExportLeadsButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const label = FORMAT_LABELS[format];

  async function handleExport() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/pixels/${pixelId}/leads/export?format=${format}`,
        { method: "GET" }
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Falha ao exportar leads.");
      }
      const blob = await response.blob();
      const filename = filenameFromContentDisposition(
        response.headers.get("Content-Disposition"),
        `leads.${format}`
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar",
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
      aria-label={`Exportar leads em ${label}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Exportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" aria-hidden="true" />
          Exportar {label}
        </>
      )}
    </Button>
  );
}
