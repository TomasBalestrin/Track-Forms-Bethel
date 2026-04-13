"use client";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClipboard } from "@/hooks/useClipboard";

interface WebhookUrlCopyProps {
  url: string;
}

export function WebhookUrlCopy({ url }: WebhookUrlCopyProps) {
  const { copied, copy } = useClipboard();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="webhook-url">Webhook URL</Label>
      <div className="flex items-stretch gap-2">
        <Input
          id="webhook-url"
          readOnly
          value={url}
          className="font-mono text-xs"
          onFocus={(e) => e.target.select()}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => copy(url)}
          aria-label="Copiar webhook URL"
          className="shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar
            </>
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Cole esta URL no webhook do seu formulário Framer.
      </p>
    </div>
  );
}
