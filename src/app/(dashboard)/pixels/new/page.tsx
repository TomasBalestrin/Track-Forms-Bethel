import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PixelForm } from "@/components/pixels/PixelForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function NewPixelPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-2">
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
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Novo Pixel
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um pixel do Facebook para começar a receber webhooks do
          Framer.
        </p>
      </div>

      <Card>
        <CardHeader />
        <CardContent>
          <PixelForm />
        </CardContent>
      </Card>
    </div>
  );
}
