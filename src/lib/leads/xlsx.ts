import * as XLSX from "xlsx";

import { TRACKING_FIELDS } from "@/lib/webhook/parser";
import type { LeadSubmission } from "@/types/lead";

const FIXED_COLUMNS = [
  "created_at",
  "email",
  "is_qualified",
  "fb_sent_at",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "submission_id",
] as const;

function normalizeCell(value: unknown): string | number | boolean | null {
  if (value === null || value === undefined) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  return JSON.stringify(value);
}

function collectDynamicFields(leads: LeadSubmission[]): string[] {
  const tracking = new Set<string>(TRACKING_FIELDS);
  const seen = new Set<string>();
  for (const lead of leads) {
    const form = lead.form_data ?? {};
    for (const key of Object.keys(form)) {
      if (tracking.has(key)) continue;
      seen.add(key);
    }
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/**
 * Gera um workbook XLSX com colunas fixas (tracking + metadados)
 * seguidas das perguntas observadas em qualquer lead.
 */
export function buildLeadsXlsx(leads: LeadSubmission[]): Uint8Array {
  const dynamicFields = collectDynamicFields(leads);
  const headers = [...FIXED_COLUMNS, ...dynamicFields];

  const rows: (string | number | boolean | null)[][] = [headers.slice()];
  for (const lead of leads) {
    const form = lead.form_data ?? {};
    const fixed = [
      lead.created_at,
      lead.email,
      lead.is_qualified ? "qualified" : "unqualified",
      lead.fb_sent_at,
      lead.utm_source,
      lead.utm_medium,
      lead.utm_campaign,
      lead.utm_content,
      lead.utm_term,
      lead.fbclid,
      lead.submission_id,
    ];
    const dynamic = dynamicFields.map((f) => form[f]);
    rows.push([...fixed, ...dynamic].map(normalizeCell));
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");

  return XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  }) as Uint8Array;
}

export function buildLeadsXlsxFilename(pixelName: string): string {
  const slug = pixelName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const date = new Date().toISOString().slice(0, 10);
  return `leads-${slug || "pixel"}-${date}.xlsx`;
}
