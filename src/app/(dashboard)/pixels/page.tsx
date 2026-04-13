import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PixelsGrid } from "./pixels-grid";

export default function PixelsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Pixels
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus pixels do Facebook e webhooks.
          </p>
        </div>
        <Button asChild>
          <Link href="/pixels/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo Pixel
          </Link>
        </Button>
      </header>

      <PixelsGrid />
    </div>
  );
}
