import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Pixel } from "@/types/pixel";

import { PixelDeleteDialog } from "./PixelDeleteDialog";

interface PixelCardProps {
  pixel: Pixel;
  totalLeads?: number;
  qualifiedLeads?: number;
  qualificationRate?: number;
}

export function PixelCard({
  pixel,
  totalLeads = 0,
  qualifiedLeads = 0,
  qualificationRate = 0,
}: PixelCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
            aria-hidden="true"
          >
            <Radio className="h-4 w-4" />
          </div>
          <h2 className="font-heading text-base font-semibold">{pixel.name}</h2>
        </div>
        <Badge variant="outline" className="w-fit font-mono text-[11px]">
          {pixel.pixel_id}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1">
        <dl className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <dt className="text-muted-foreground">Total</dt>
            <dd className="text-base font-semibold">{totalLeads}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Qualificados</dt>
            <dd className="text-base font-semibold">{qualifiedLeads}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Taxa</dt>
            <dd className="text-base font-semibold">{qualificationRate}%</dd>
          </div>
        </dl>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <PixelDeleteDialog pixel={pixel} />
        <Button asChild size="sm">
          <Link href={`/pixels/${pixel.id}`}>
            Ver leads
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
