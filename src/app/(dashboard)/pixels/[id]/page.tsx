import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LeadsTable } from "@/components/leads/LeadsTable";
import { SnippetCopy } from "@/components/pixels/SnippetCopy";
import { WebhookUrlCopy } from "@/components/pixels/WebhookUrlCopy";
import { QualificationDrawer } from "@/components/qualification/QualificationDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buildWebhookUrl, generateSnippet } from "@/lib/snippet/generator";
import { createClient } from "@/lib/supabase/server";
import { pixelService, PixelServiceError } from "@/services/pixelService";

interface PageProps {
  params: { id: string };
}

interface PixelStatsRow {
  total_leads: number | null;
  qualified_leads: number | null;
  fb_sent_count: number | null;
}

export default async function PixelDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  let pixel;
  try {
    pixel = await pixelService.getById(supabase, user.id, params.id);
  } catch (error) {
    if (error instanceof PixelServiceError && error.code === "not_found") {
      notFound();
    }
    throw error;
  }

  const [{ data: statsRow }, { count: rulesCount }] = await Promise.all([
    supabase
      .from("pixel_stats")
      .select("total_leads, qualified_leads, fb_sent_count")
      .eq("id", pixel.id)
      .maybeSingle(),
    supabase
      .from("qualification_rules")
      .select("id", { count: "exact", head: true })
      .eq("pixel_id", pixel.id),
  ]);

  const stats = (statsRow ?? null) as PixelStatsRow | null;
  const total = Number(stats?.total_leads ?? 0);
  const qualified = Number(stats?.qualified_leads ?? 0);
  const fbSent = Number(stats?.fb_sent_count ?? 0);
  const unqualified = Math.max(total - qualified, 0);
  const hasRules = (rulesCount ?? 0) > 0;

  const webhookUrl = buildWebhookUrl(pixel.webhook_token);
  const snippet = generateSnippet();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground"
        >
          <Link href="/pixels">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </Link>
        </Button>
      </div>

      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {pixel.name}
          </h1>
          <Badge variant="outline" className="w-fit font-mono text-[11px]">
            {pixel.pixel_id}
          </Badge>
        </div>
        <QualificationDrawer pixelId={pixel.id} pixelName={pixel.name} />
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integração com o Framer</CardTitle>
          <CardDescription>
            Webhook URL e snippet para capturar UTMs + fbclid.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <WebhookUrlCopy url={webhookUrl} />
          <Separator />
          <SnippetCopy snippet={snippet} />
        </CardContent>
      </Card>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard label="Total de leads" value={total} />
        <StatCard label="Qualificados" value={qualified} />
        <StatCard label="Enviados ao FB" value={fbSent} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold">Leads</h2>
        <LeadsTable
          pixelId={pixel.id}
          hasRules={hasRules}
          webhookUrl={webhookUrl}
          stats={{ total, qualified, unqualified }}
        />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-heading text-2xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}
