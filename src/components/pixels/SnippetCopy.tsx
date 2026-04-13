"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useClipboard } from "@/hooks/useClipboard";
import { cn } from "@/lib/utils";

interface SnippetCopyProps {
  snippet: string;
}

export function SnippetCopy({ snippet }: SnippetCopyProps) {
  const [expanded, setExpanded] = useState(false);
  const { copied, copy } = useClipboard();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>Snippet JS</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
                Esconder
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                Ver código
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copy(snippet)}
            aria-label="Copiar snippet"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copiar Snippet
              </>
            )}
          </Button>
        </div>
      </div>

      <pre
        className={cn(
          "overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-[11px] leading-relaxed",
          expanded ? "max-h-none" : "max-h-24"
        )}
      >
        <code>{snippet}</code>
      </pre>

      <p className="text-xs text-muted-foreground">
        Cole no Framer em{" "}
        <span className="font-medium">
          Site Settings → General → Custom Code → End of &lt;head&gt;
        </span>
        . Crie hidden inputs nomeados{" "}
        <code className="rounded bg-muted px-1">fbclid</code>,{" "}
        <code className="rounded bg-muted px-1">utm_source</code>,{" "}
        <code className="rounded bg-muted px-1">utm_medium</code>,{" "}
        <code className="rounded bg-muted px-1">utm_campaign</code>,{" "}
        <code className="rounded bg-muted px-1">utm_content</code>,{" "}
        <code className="rounded bg-muted px-1">utm_term</code> no seu form.
      </p>
    </div>
  );
}
