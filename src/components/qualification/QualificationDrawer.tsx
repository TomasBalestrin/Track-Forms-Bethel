"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Settings2, X } from "lucide-react";

import { QuestionRuleCard } from "@/components/qualification/QuestionRuleCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useRulesConfig, useSaveRules } from "@/hooks/useRules";
import { TRACKING_FIELDS } from "@/lib/webhook/parser";
import { cn } from "@/lib/utils";
import type { LeadSubmission } from "@/types/lead";
import type { QualificationRule } from "@/types/rule";

interface QualificationDrawerProps {
  pixelId: string;
  pixelName: string;
}

interface RuleDraft {
  selected: Set<string>;
  isActive: boolean;
}

type RulesDraft = Record<string, RuleDraft>;

interface QuestionsMap {
  fields: string[];
  answersByField: Record<string, string[]>;
}

function buildQuestionsFromSamples(leads: LeadSubmission[]): QuestionsMap {
  const answersByField: Record<string, Set<string>> = {};
  for (const lead of leads) {
    const form = lead.form_data ?? {};
    for (const [key, value] of Object.entries(form)) {
      if ((TRACKING_FIELDS as readonly string[]).includes(key)) continue;
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (!trimmed) continue;
      if (!answersByField[key]) answersByField[key] = new Set();
      answersByField[key].add(trimmed);
    }
  }
  const fields = Object.keys(answersByField).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  const out: Record<string, string[]> = {};
  for (const f of fields) {
    out[f] = Array.from(answersByField[f]).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }
  return { fields, answersByField: out };
}

function buildInitialDraft(
  rules: QualificationRule[],
  questions: QuestionsMap
): RulesDraft {
  const draft: RulesDraft = {};
  const byField = new Map(rules.map((r) => [r.field_name, r]));

  for (const field of questions.fields) {
    const rule = byField.get(field);
    draft[field] = {
      selected: new Set(rule?.qualified_values ?? []),
      isActive: rule?.is_active ?? false,
    };
  }
  // Include rules stored for fields no longer observed in sample leads.
  for (const rule of rules) {
    if (!draft[rule.field_name]) {
      draft[rule.field_name] = {
        selected: new Set(rule.qualified_values),
        isActive: rule.is_active,
      };
    }
  }
  return draft;
}

export function QualificationDrawer({
  pixelId,
  pixelName,
}: QualificationDrawerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<RulesDraft>({});
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useRulesConfig(pixelId, open);
  const saveMutation = useSaveRules(pixelId);

  const questions = useMemo(
    () =>
      data
        ? buildQuestionsFromSamples(data.sample_leads)
        : { fields: [], answersByField: {} },
    [data]
  );

  useEffect(() => {
    if (!data) return;
    setDraft(buildInitialDraft(data.data, questions));
  }, [data, questions]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  function toggleActive(field: string, next: boolean) {
    setDraft((prev) => ({
      ...prev,
      [field]: {
        isActive: next,
        selected: prev[field]?.selected ?? new Set(),
      },
    }));
  }

  function toggleAnswer(field: string, answer: string, next: boolean) {
    setDraft((prev) => {
      const current =
        prev[field] ?? { selected: new Set<string>(), isActive: true };
      const selected = new Set(current.selected);
      if (next) selected.add(answer);
      else selected.delete(answer);
      return {
        ...prev,
        [field]: { ...current, selected },
      };
    });
  }

  async function handleSave() {
    const rules = Object.entries(draft)
      .map(([field_name, value]) => ({
        field_name,
        qualified_values: Array.from(value.selected),
        is_active: value.isActive,
      }))
      .filter((r) => r.is_active || r.qualified_values.length > 0);

    try {
      const result = await saveMutation.mutateAsync(rules);
      toast({
        title: "Regras salvas.",
        description: `${result.leads_requalified} leads requalificados · ${result.newly_qualified} novos qualificados · ${result.fb_sent} enviados ao Facebook.`,
      });
      setOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar regras",
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  const saving = saveMutation.isPending;
  const hasLeads = (data?.sample_leads?.length ?? 0) > 0;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Settings2 className="h-4 w-4" aria-hidden="true" />
        Configurar Qualificação
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-40",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Configurar qualificação"
          className={cn(
            "absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l bg-background shadow-xl transition-transform duration-200 sm:inset-y-0",
            open ? "translate-x-0" : "translate-x-full"
          )}
        >
          <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
            <div>
              <h2 className="font-heading text-base font-semibold">
                Configurar Qualificação
              </h2>
              <p className="text-xs text-muted-foreground">
                Pixel <span className="font-medium">{pixelName}</span> —
                baseado nos primeiros 5 leads recebidos.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : isError ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Erro ao carregar configuração."}
              </p>
            ) : !hasLeads ? (
              <p className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Aguardando primeiras submissões para exibir as perguntas do
                formulário.
              </p>
            ) : questions.fields.length === 0 ? (
              <p className="rounded-md border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Os primeiros leads não têm campos que possam virar critério de
                qualificação.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {questions.fields.map((field) => {
                  const answers = questions.answersByField[field];
                  const state =
                    draft[field] ?? {
                      selected: new Set<string>(),
                      isActive: false,
                    };
                  return (
                    <QuestionRuleCard
                      key={field}
                      fieldName={field}
                      answers={answers}
                      selectedAnswers={Array.from(state.selected)}
                      isActive={state.isActive}
                      onToggleActive={(next) => toggleActive(field, next)}
                      onToggleAnswer={(answer, next) =>
                        toggleAnswer(field, answer, next)
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>

          <footer className="sticky bottom-0 flex items-center justify-end gap-2 border-t bg-background px-5 py-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasLeads || questions.fields.length === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Salvando e requalificando...
                </>
              ) : (
                "Salvar Regras"
              )}
            </Button>
          </footer>
        </aside>
      </div>
    </>
  );
}
