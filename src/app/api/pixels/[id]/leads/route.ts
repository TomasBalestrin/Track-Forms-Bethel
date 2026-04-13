import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { leadService, LeadServiceError } from "@/services/leadService";
import { pixelService, PixelServiceError } from "@/services/pixelService";
import type { LeadFilter } from "@/types/lead";

interface RouteContext {
  params: { id: string };
}

function parseFilter(raw: string | null): LeadFilter {
  if (raw === "qualified" || raw === "unqualified") return raw;
  return "all";
}

function parsePositiveInt(raw: string | null, fallback: number) {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ownership check — 404 if pixel não existe ou não pertence ao user.
    await pixelService.getById(supabase, user.id, params.id);

    const url = new URL(request.url);
    const filter = parseFilter(url.searchParams.get("filter"));
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(
      parsePositiveInt(url.searchParams.get("pageSize"), 50),
      200
    );

    const result = await leadService.listLeads(supabase, {
      pixelId: params.id,
      filter,
      page,
      pageSize,
    });

    return NextResponse.json({
      data: result.data,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (error) {
    if (error instanceof PixelServiceError && error.code === "not_found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof LeadServiceError) {
      console.error(`[GET /api/pixels/${params.id}/leads]`, error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
    console.error(`[GET /api/pixels/${params.id}/leads]`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
