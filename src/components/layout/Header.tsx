"use client";

import { Menu, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";

export function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      <div className="flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Target className="h-4 w-4" />
        </div>
        <span className="font-heading text-sm font-semibold">
          Lead Qualifier
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Abrir menu de navegação"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
    </header>
  );
}
