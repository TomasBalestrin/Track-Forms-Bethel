"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface AnswerCheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
}

export function AnswerCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
}: AnswerCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
        checked ? "border-primary bg-primary/5" : "border-input hover:bg-accent",
        disabled ? "cursor-not-allowed opacity-50" : ""
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input"
        )}
        aria-hidden="true"
      >
        {checked ? <Check className="h-3 w-3" /> : null}
      </span>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span className="break-words">{label}</span>
    </label>
  );
}
