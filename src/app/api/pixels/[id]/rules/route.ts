import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { SaveRulesSchema } from "@/lib/validations/rules";
import { capiService } from "@/services/capiService";
import { leadService, LeadServiceError } from "@/services/leadService";
import { pixelService, PixelServiceError } from "@/services/pixelService";
import { ruleService, RuleServiceError } from "@/services/ruleService";

interface RouteContext {
  params: { id: string };
}

function handleError(route: string, error: unknown) {
  if (error instanceof PixelServiceError && error.code === "not_found") {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof LeadServiceError || error instanceof RuleServiceError) {
    console.error(`[${route}]`, error);
  } else {
    console.error(`[${route}]`, error);
  }
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pixel = await pixelService.getById(supabase, user.id, params.id);
    const [rules, sampleLeads] = await Promise.all([
      ruleService.getRules(supabase, pixel.id),
      leadService.getSampleLeads(supabase, pixel.id, 5),
    ]);

    return NextResponse.json({
      data: rules,
      sample_leads: sampleLeads,
    });
  } catch (error) {
    return handleError(`GET /api/pixels/${params.id}/rules`, error);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pixel = await pixelService.getById(supabase, user.id, params.id);

    const body = await request.json().catch(() => null);
    const parsed = SaveRulesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const savedRules = await ruleService.saveRules(
      supabase,
      pixel.id,
      parsed.data.rules
    );

    const { requalified, newlyQualified } = await leadService.requalifyAll(
      supabase,
      pixel.id,
      savedRules
    );

    let sent = 0;
    for (const lead of newlyQualified) {
      if (lead.fb_sent_at) continue;
      const res = await capiService.sendLeadEvent({ pixel, lead });
      if (res.success) {
        await leadService
          .updateFbSentAt(supabase, lead.id)
          .catch((err) =>
            console.error(
              `[POST /api/pixels/${params.id}/rules] fb_sent_at`,
              err
            )
          );
        sent += 1;
      } else {
        console.error(
          `[POST /api/pixels/${params.id}/rules] CAPI`,
          res.error
        );
      }
    }

    return NextResponse.json({
      data: {
        rules_saved: savedRules.length,
        leads_requalified: requalified,
        newly_qualified: newlyQualified.length,
        fb_sent: sent,
      },
    });
  } catch (error) {
    return handleError(`POST /api/pixels/${params.id}/rules`, error);
  }
}
