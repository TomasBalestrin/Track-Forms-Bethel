"use client";

import { Button } from "@/components/ui/button";
import { useLeadsFilterStore } from "@/stores/leadsFilterStore";
import type { LeadFilter } from "@/types/lead";

interface FilterOption {
  value: LeadFilter;
  label: string;
  count?: number;
}

interface LeadsFilterProps {
  total?: number;
  qualified?: number;
  unqualified?: number;
}

export function LeadsFilter({
  total,
  qualified,
  unqualified,
}: LeadsFilterProps) {
  const { filter, setFilter } = useLeadsFilterStore();

  const options: FilterOption[] = [
    { value: "all", label: "Todos", count: total },
    { value: "qualified", label: "Qualificados", count: qualified },
    { value: "unqualified", label: "Não qualificados", count: unqualified },
  ];

  return (
    <div
      role="group"
      aria-label="Filtro de leads"
      className="flex flex-wrap gap-2"
    >
      {options.map((option) => {
        const active = filter === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            onClick={() => setFilter(option.value)}
            aria-pressed={active}
          >
            {option.label}
            {option.count !== undefined ? (
              <span
                className={
                  active
                    ? "ml-1 text-xs opacity-90"
                    : "ml-1 text-xs text-muted-foreground"
                }
              >
                {option.count}
              </span>
            ) : null}
          </Button>
        );
      })}
    </div>
  );
}
