import { buildFbc, hashEmail } from "@/lib/facebook/hash";
import type { LeadSubmission } from "@/types/lead";
import type { Pixel } from "@/types/pixel";

const FB_GRAPH_VERSION = "v18.0";
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 300;

export interface CapiSendResult {
  success: boolean;
  error?: string;
}

interface SendLeadEventArgs {
  pixel: Pick<Pixel, "pixel_id" | "capi_token">;
  lead: Pick<
    LeadSubmission,
    | "id"
    | "email"
    | "fbclid"
    | "utm_source"
    | "utm_medium"
    | "utm_campaign"
    | "utm_content"
    | "utm_term"
    | "created_at"
  >;
  eventSourceUrl?: string;
}

function buildPayload({ pixel, lead, eventSourceUrl }: SendLeadEventArgs) {
  const userData: Record<string, unknown> = {};
  if (lead.email) {
    userData.em = [hashEmail(lead.email)];
  }
  const fbc = buildFbc(lead.fbclid);
  if (fbc) {
    userData.fbc = fbc;
  }

  const customData: Record<string, unknown> = {};
  if (lead.utm_source) customData.utm_source = lead.utm_source;
  if (lead.utm_medium) customData.utm_medium = lead.utm_medium;
  if (lead.utm_campaign) customData.utm_campaign = lead.utm_campaign;
  if (lead.utm_content) customData.utm_content = lead.utm_content;
  if (lead.utm_term) customData.utm_term = lead.utm_term;

  const eventTimeSec = Math.floor(
    new Date(lead.created_at ?? Date.now()).getTime() / 1000
  );

  const event: Record<string, unknown> = {
    event_name: "Lead",
    event_time: eventTimeSec,
    event_id: lead.id, // deduplicação FB
    action_source: "website",
    user_data: userData,
    custom_data: customData,
  };

  if (eventSourceUrl) {
    event.event_source_url = eventSourceUrl;
  }

  return {
    data: [event],
    access_token: pixel.capi_token,
  };
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Envia evento Lead ao Facebook CAPI. Não lança — retorna CapiSendResult.
 * 3 tentativas com backoff exponencial (300ms, 600ms, 1200ms).
 */
export const capiService = {
  async sendLeadEvent(args: SendLeadEventArgs): Promise<CapiSendResult> {
    const { pixel } = args;
    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${encodeURIComponent(
      pixel.pixel_id
    )}/events`;
    const payload = buildPayload(args);

    let lastError = "unknown error";
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          return { success: true };
        }

        // 4xx permanentes — não tenta de novo (token inválido, payload ruim)
        if (res.status >= 400 && res.status < 500) {
          const body = await res.text().catch(() => "");
          return {
            success: false,
            error: `FB CAPI ${res.status}: ${body.slice(0, 500)}`,
          };
        }

        lastError = `FB CAPI ${res.status}`;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }

      if (attempt < MAX_RETRIES - 1) {
        await sleep(BASE_BACKOFF_MS * Math.pow(2, attempt));
      }
    }

    return { success: false, error: lastError };
  },
};
