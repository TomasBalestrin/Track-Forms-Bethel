import { NextResponse } from "next/server";

import { buildLeadsXlsx, buildLeadsXlsxFilename } from "@/lib/leads/xlsx";
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

    const raw = buildLeadsXlsx(leads);
    const filename = buildLeadsXlsxFilename(pixel.name);
    const body = new Uint8Array(new ArrayBuffer(raw.byteLength));
    body.set(raw);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(body.byteLength),
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
