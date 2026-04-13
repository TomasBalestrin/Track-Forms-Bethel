"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { LeadRow } from "@/components/leads/LeadRow";
import { LeadsFilter } from "@/components/leads/LeadsFilter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LEADS_PAGE_SIZE, useLeads } from "@/hooks/useLeads";
import { useLeadsFilterStore } from "@/stores/leadsFilterStore";

interface LeadsTableProps {
  pixelId: string;
  hasRules: boolean;
  webhookUrl: string;
  stats?: {
    total: number;
    qualified: number;
    unqualified: number;
  };
}

export function LeadsTable({
  pixelId,
  hasRules,
  webhookUrl,
  stats,
}: LeadsTableProps) {
  const { filter, page, setPage } = useLeadsFilterStore();

  const { data, isLoading, isError, error, isPlaceholderData } = useLeads({
    pixelId,
    filter,
    page,
    pageSize: LEADS_PAGE_SIZE,
  });

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1;
  const canPrev = page > 1;
  const canNext = !!data && page < totalPages;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LeadsFilter
          total={stats?.total}
          qualified={stats?.qualified}
          unqualified={stats?.unqualified}
        />
        {data ? (
          <p className="text-xs text-muted-foreground">
            {data.total} {data.total === 1 ? "lead" : "leads"} no total
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[110px]">Data</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[130px]">Status</TableHead>
              <TableHead className="hidden w-[110px] md:table-cell">FB</TableHead>
              <TableHead className="hidden lg:table-cell">Campanha</TableHead>
              <TableHead className="w-10" aria-label="Expandir" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="py-3">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <p className="text-sm text-destructive">
                    {error instanceof Error
                      ? error.message
                      : "Erro ao carregar leads."}
                  </p>
                </TableCell>
              </TableRow>
            ) : !data || data.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  <EmptyStateContent
                    filter={filter}
                    webhookUrl={webhookUrl}
                    hasRules={hasRules}
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((lead) => (
                <LeadRow key={lead.id} lead={lead} hasRules={hasRules} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.total > 0 ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!canPrev || isPlaceholderData}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!canNext || isPlaceholderData}
            >
              Próxima
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyStateContent({
  filter,
  webhookUrl,
  hasRules,
}: {
  filter: "all" | "qualified" | "unqualified";
  webhookUrl: string;
  hasRules: boolean;
}) {
  if (filter === "qualified" && !hasRules) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Nenhum lead qualificado ainda. Configure as regras de qualificação.
        </p>
      </div>
    );
  }
  if (filter !== "all") {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum lead neste filtro.
      </p>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
      <p>Nenhum lead recebido ainda.</p>
      <p>
        Cole o webhook URL no seu formulário Framer:
        <br />
        <code className="mt-1 inline-block break-all rounded bg-muted px-1.5 py-0.5 text-[11px]">
          {webhookUrl}
        </code>
      </p>
    </div>
  );
}
