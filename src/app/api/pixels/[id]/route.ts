import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { UpdatePixelSchema } from "@/lib/validations/pixel";
import { pixelService, PixelServiceError } from "@/services/pixelService";

interface RouteContext {
  params: { id: string };
}

function errorToResponse(error: unknown, route: string) {
  if (error instanceof PixelServiceError) {
    if (error.code === "not_found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.code === "conflict") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
  }
  console.error(`[${route}]`, error);
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

    const data = await pixelService.getById(supabase, user.id, params.id);
    return NextResponse.json({ data });
  } catch (error) {
    return errorToResponse(error, `GET /api/pixels/${params.id}`);
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = UpdatePixelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = await pixelService.update(
      supabase,
      user.id,
      params.id,
      parsed.data
    );
    return NextResponse.json({ data });
  } catch (error) {
    return errorToResponse(error, `PATCH /api/pixels/${params.id}`);
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await pixelService.delete(supabase, user.id, params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorToResponse(error, `DELETE /api/pixels/${params.id}`);
  }
}
