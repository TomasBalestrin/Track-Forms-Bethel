import type { LeadSubmission } from "@/types/lead";
import type { Pixel } from "@/types/pixel";

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 300;
const TIMEOUT_MS = 8000;

export interface QualifiedWebhookResult {
  success: boolean;
  error?: string;
}

interface SendArgs {
  url: string;
  pixel: Pick<Pixel, "id" | "name" | "pixel_id">;
  lead: LeadSubmission;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildPayload({ pixel, lead }: Pick<SendArgs, "pixel" | "lead">) {
  return {
    event: "qualified_lead",
    pixel: {
      id: pixel.id,
      name: pixel.name,
      pixel_id: pixel.pixel_id,
    },
    lead: {
      id: lead.id,
      email: lead.email,
      is_qualified: lead.is_qualified,
      submission_id: lead.submission_id,
      fbclid: lead.fbclid,
      utm_source: lead.utm_source,
      utm_medium: lead.utm_medium,
      utm_campaign: lead.utm_campaign,
      utm_content: lead.utm_content,
      utm_term: lead.utm_term,
      form_data: lead.form_data,
      created_at: lead.created_at,
    },
  };
}

/**
 * Envia os dados do lead qualificado para o webhook externo configurado.
 * Não lança — retorna QualifiedWebhookResult. 3 tentativas com backoff.
 */
export const qualifiedWebhookService = {
  async sendLead(args: SendArgs): Promise<QualifiedWebhookResult> {
    const body = JSON.stringify(buildPayload(args));

    let lastError = "unknown error";
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(args.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          return { success: true };
        }

        if (res.status >= 400 && res.status < 500) {
          const text = await res.text().catch(() => "");
          return {
            success: false,
            error: `Qualified webhook ${res.status}: ${text.slice(0, 300)}`,
          };
        }

        lastError = `Qualified webhook ${res.status}`;
      } catch (err) {
        clearTimeout(timer);
        lastError = err instanceof Error ? err.message : String(err);
      }

      if (attempt < MAX_RETRIES - 1) {
        await sleep(BASE_BACKOFF_MS * Math.pow(2, attempt));
      }
    }

    return { success: false, error: lastError };
  },
};
