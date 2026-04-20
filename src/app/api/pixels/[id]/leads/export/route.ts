import { NextResponse } from "next/server";

import { buildLeadsCsv, buildLeadsCsvFilename } from "@/lib/leads/csv";
import { createClient } from "@/lib/supabase/server";
import { leadService, LeadServiceError } from "@/services/leadService";
import { pixelService, PixelServiceError } from "@/services/pixelService";

interface RouteContext {
  params: { id: string };
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
    const leads = await leadService.listAllLeads(supabase, pixel.id);

    const csv = buildLeadsCsv(leads);
    const filename = buildLeadsCsvFilename(pixel.name);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof PixelServiceError && error.code === "not_found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(`[GET /api/pixels/${params.id}/leads/export]`, error);
    if (error instanceof LeadServiceError) {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
