"use client";

import { useId } from "react";

import { AnswerCheckbox } from "@/components/qualification/AnswerCheckbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuestionRuleCardProps {
  fieldName: string;
  answers: string[];
  selectedAnswers: string[];
  isActive: boolean;
  onToggleActive: (next: boolean) => void;
  onToggleAnswer: (answer: string, next: boolean) => void;
}

export function QuestionRuleCard({
  fieldName,
  answers,
  selectedAnswers,
  isActive,
  onToggleActive,
  onToggleAnswer,
}: QuestionRuleCardProps) {
  const switchId = useId();
  const selected = new Set(selectedAnswers);

  return (
    <Card className={cn(!isActive && "opacity-75")}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-sm font-semibold">{fieldName}</h3>
          <p className="text-xs text-muted-foreground">
            Marque as respostas que qualificam o lead.
          </p>
        </div>
        <label
          htmlFor={switchId}
          className="flex items-center gap-2 text-xs font-medium"
        >
          <span className="text-muted-foreground">
            {isActive ? "Ativo" : "Inativo"}
          </span>
          <span
            className={cn(
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
              isActive ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform",
                isActive ? "translate-x-4" : "translate-x-0.5"
              )}
            />
          </span>
          <input
            id={switchId}
            type="checkbox"
            className="sr-only"
            checked={isActive}
            onChange={(e) => onToggleActive(e.target.checked)}
          />
        </label>
      </CardHeader>

      <CardContent className="pt-0">
        {answers.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma resposta registrada nos primeiros leads.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {answers.map((answer) => (
              <AnswerCheckbox
                key={answer}
                id={`${fieldName}-${answer}`}
                label={answer}
                checked={selected.has(answer)}
                disabled={!isActive}
                onCheckedChange={(next) => onToggleAnswer(answer, next)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
