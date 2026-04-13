"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type {
  LeadFilter,
  LeadSubmission,
  ListLeadsResult,
} from "@/types/lead";

export const LEADS_PAGE_SIZE = 50;

interface UseLeadsArgs {
  pixelId: string;
  filter: LeadFilter;
  page: number;
  pageSize?: number;
}

async function fetchLeads({
  pixelId,
  filter,
  page,
  pageSize,
}: UseLeadsArgs): Promise<ListLeadsResult> {
  const url = new URL(
    `/api/pixels/${pixelId}/leads`,
    typeof window === "undefined" ? "http://localhost" : window.location.origin
  );
  url.searchParams.set("filter", filter);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize ?? LEADS_PAGE_SIZE));

  const res = await fetch(url.pathname + url.search, { cache: "no-store" });
  if (!res.ok) {
    let message = "Erro ao carregar leads.";
    try {
      const body = await res.json();
      if (typeof body?.error === "string") message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as ListLeadsResult;
}

export function useLeads(args: UseLeadsArgs) {
  return useQuery({
    queryKey: ["leads", args.pixelId, args.filter, args.page, args.pageSize],
    queryFn: () => fetchLeads(args),
    placeholderData: keepPreviousData,
  });
}

export type { LeadSubmission };
