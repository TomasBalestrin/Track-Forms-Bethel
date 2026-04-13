"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { LeadSubmission } from "@/types/lead";
import type { QualificationRule, QualificationRuleInput } from "@/types/rule";

interface RulesConfigResponse {
  data: QualificationRule[];
  sample_leads: LeadSubmission[];
}

interface SaveRulesResponse {
  data: {
    rules_saved: number;
    leads_requalified: number;
    newly_qualified: number;
    fb_sent: number;
  };
}

async function parseError(res: Response) {
  try {
    const body = await res.json();
    if (typeof body?.error === "string") return body.error;
  } catch {
    // ignore
  }
  return "Erro ao processar a requisição.";
}

async function fetchRulesConfig(pixelId: string): Promise<RulesConfigResponse> {
  const res = await fetch(`/api/pixels/${pixelId}/rules`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as RulesConfigResponse;
}

async function postRules(
  pixelId: string,
  rules: QualificationRuleInput[]
): Promise<SaveRulesResponse["data"]> {
  const res = await fetch(`/api/pixels/${pixelId}/rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rules }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  const body = (await res.json()) as SaveRulesResponse;
  return body.data;
}

export function rulesQueryKey(pixelId: string) {
  return ["rules", pixelId] as const;
}

export function useRulesConfig(pixelId: string, enabled = true) {
  return useQuery({
    queryKey: rulesQueryKey(pixelId),
    queryFn: () => fetchRulesConfig(pixelId),
    enabled,
  });
}

export function useSaveRules(pixelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rules: QualificationRuleInput[]) => postRules(pixelId, rules),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rulesQueryKey(pixelId) });
      qc.invalidateQueries({ queryKey: ["leads", pixelId] });
      qc.invalidateQueries({ queryKey: ["pixels"] });
    },
  });
}
