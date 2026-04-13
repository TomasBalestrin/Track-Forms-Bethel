import { TRACKING_FIELDS } from "@/lib/webhook/parser";
import type { LeadSubmission } from "@/types/lead";

interface LeadExpandedDataProps {
  lead: LeadSubmission;
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}

function truncate(value: string, max = 80) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}…`;
}

export function LeadExpandedData({ lead }: LeadExpandedDataProps) {
  const form = lead.form_data ?? {};
  const formEntries = Object.entries(form).filter(
    ([key]) => !(TRACKING_FIELDS as readonly string[]).includes(key)
  );

  const attributionEntries: Array<[string, string | null]> = [
    ["fbclid", lead.fbclid],
    ["utm_source", lead.utm_source],
    ["utm_medium", lead.utm_medium],
    ["utm_campaign", lead.utm_campaign],
    ["utm_content", lead.utm_content],
    ["utm_term", lead.utm_term],
  ];

  return (
    <div className="grid gap-6 rounded-md border bg-muted/30 p-4 text-xs md:grid-cols-2">
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Respostas do Formulário
        </h3>
        {formEntries.length === 0 ? (
          <p className="text-muted-foreground">Sem respostas registradas.</p>
        ) : (
          <dl className="grid grid-cols-[minmax(0,140px)_1fr] gap-x-3 gap-y-1">
            {formEntries.map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="truncate font-medium text-muted-foreground">
                  {key}
                </dt>
                <dd className="break-words">
                  {truncate(stringifyValue(value))}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Atribuição
        </h3>
        <dl className="grid grid-cols-[minmax(0,140px)_1fr] gap-x-3 gap-y-1">
          {attributionEntries.map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="truncate font-medium text-muted-foreground">
                {key}
              </dt>
              <dd className="break-words font-mono text-[11px]">
                {value ? truncate(value) : "—"}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
