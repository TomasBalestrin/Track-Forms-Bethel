"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { LeadSubmission } from "@/types/lead";

import { LeadExpandedData } from "./LeadExpandedData";

interface LeadRowProps {
  lead: LeadSubmission;
  hasRules: boolean;
}

const ABSOLUTE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("pt-BR", {
  numeric: "auto",
});

function formatRelative(iso: string) {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  if (Math.abs(diffMin) < 60) return RELATIVE_FORMATTER.format(diffMin, "minute");
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return RELATIVE_FORMATTER.format(diffH, "hour");
  const diffD = Math.round(diffH / 24);
  if (Math.abs(diffD) < 30) return RELATIVE_FORMATTER.format(diffD, "day");
  const diffMo = Math.round(diffD / 30);
  return RELATIVE_FORMATTER.format(diffMo, "month");
}

function truncate(value: string | null, max = 32) {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function StatusBadge({ lead, hasRules }: { lead: LeadSubmission; hasRules: boolean }) {
  if (!hasRules) {
    return <Badge variant="secondary">Sem regras</Badge>;
  }
  if (lead.is_qualified) {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
        Qualificado
      </Badge>
    );
  }
  return <Badge variant="destructive">Não qualificado</Badge>;
}

export function LeadRow({ lead, hasRules }: LeadRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <TableRow
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer"
      >
        <TableCell className="whitespace-nowrap text-xs">
          <span title={ABSOLUTE_FORMATTER.format(new Date(lead.created_at))}>
            {formatRelative(lead.created_at)}
          </span>
        </TableCell>
        <TableCell className="max-w-[220px] truncate text-sm">
          {lead.email ?? "—"}
        </TableCell>
        <TableCell>
          <StatusBadge lead={lead} hasRules={hasRules} />
        </TableCell>
        <TableCell>
          {lead.fb_sent_at ? (
            <Badge className="bg-sky-600 text-white hover:bg-sky-600/90">
              Enviado
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="hidden max-w-[180px] truncate text-xs text-muted-foreground md:table-cell">
          {truncate(lead.utm_campaign)}
        </TableCell>
        <TableCell className="w-10 text-right">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={expanded ? "Recolher lead" : "Expandir lead"}
            aria-expanded={expanded}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                expanded ? "rotate-180" : ""
              )}
              aria-hidden="true"
            />
          </Button>
        </TableCell>
      </TableRow>
      {expanded ? (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={6} className="bg-muted/20 p-3">
            <LeadExpandedData lead={lead} />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
