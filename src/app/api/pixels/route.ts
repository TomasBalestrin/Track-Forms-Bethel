import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { CreatePixelSchema } from "@/lib/validations/pixel";
import { pixelService, PixelServiceError } from "@/services/pixelService";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await pixelService.list(supabase, user.id);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[GET /api/pixels]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = CreatePixelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = await pixelService.create(supabase, user.id, parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof PixelServiceError) {
      if (error.code === "conflict") {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }
    console.error("[POST /api/pixels]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
