import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { evaluateQualification } from "@/lib/qualification/engine";
import { parseWebhookPayload } from "@/lib/webhook/parser";
import { capiService } from "@/services/capiService";
import { leadService } from "@/services/leadService";
import { qualifiedWebhookService } from "@/services/qualifiedWebhookService";
import { ruleService } from "@/services/ruleService";
import type { Pixel } from "@/types/pixel";

export const runtime = "nodejs";

interface RouteContext {
  params: { token: string };
}

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service credentials not configured.");
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: Request, { params }: RouteContext) {
  const { token } = params;

  try {
    const supabase = createServiceClient();

    // 1) Pixel por webhook_token
    const { data: pixel, error: pixelErr } = await supabase
      .from("pixels")
      .select("*")
      .eq("webhook_token", token)
      .maybeSingle();

    if (pixelErr) {
      console.error("[POST /api/webhook] pixel lookup", pixelErr);
      // 200 para Framer não entrar em retry-loop infinito
      return NextResponse.json({ success: false }, { status: 200 });
    }
    if (!pixel) {
      return NextResponse.json(
        { error: "Pixel not found" },
        { status: 404 }
      );
    }
    const typedPixel = pixel as Pixel;

    // 2) Body + submission_id (header Framer)
    const rawBody = await request.json().catch(() => ({}));
    const submissionId =
      request.headers.get("framer-webhook-submission-id") ?? null;

    // 3) Parse
    const parsed = parseWebhookPayload(rawBody);

    // 4) Upsert (cuida de idempotência por submission_id e dedup por email)
    const upsertResult = await leadService.upsertLead(supabase, {
      pixelId: typedPixel.id,
      submissionId,
      parsed,
    });

    if (upsertResult.alreadyProcessed) {
      return NextResponse.json({ success: true, deduplicated: true });
    }

    // 5) Regras + qualificação
    const rules = await ruleService.getRules(supabase, typedPixel.id);
    const isQualified = evaluateQualification(parsed.form_data, rules);

    let lead = upsertResult.lead;
    if (lead.is_qualified !== isQualified) {
      lead = await leadService.updateQualification(
        supabase,
        lead.id,
        isQualified
      );
    }

    // 6) Dispatch paralelo: CAPI + webhook externo (se qualificado)
    if (isQualified) {
      const dispatches: Promise<unknown>[] = [];

      if (!lead.fb_sent_at) {
        dispatches.push(
          capiService
            .sendLeadEvent({ pixel: typedPixel, lead })
            .then(async (result) => {
              if (result.success) {
                await leadService
                  .updateFbSentAt(supabase, lead.id)
                  .catch((err) =>
                    console.error(
                      "[POST /api/webhook] fb_sent_at update",
                      err
                    )
                  );
              } else {
                console.error(
                  "[POST /api/webhook] CAPI failed",
                  result.error
                );
              }
            })
        );
      }

      if (typedPixel.qualified_webhook_url) {
        dispatches.push(
          qualifiedWebhookService
            .sendLead({
              url: typedPixel.qualified_webhook_url,
              pixel: typedPixel,
              lead,
            })
            .then((result) => {
              if (!result.success) {
                console.error(
                  "[POST /api/webhook] qualified webhook failed",
                  result.error
                );
              }
            })
        );
      }

      if (dispatches.length > 0) {
        await Promise.allSettled(dispatches);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/webhook]", error);
    // Por design: NUNCA 5xx ao Framer (evita retry storm).
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
