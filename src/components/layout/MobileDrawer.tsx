"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";

interface MobileDrawerProps {
  userEmail?: string | null;
}

export function MobileDrawer({ userEmail }: MobileDrawerProps) {
  const { sidebarOpen, closeSidebar } = useUIStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeSidebar();
    }
    if (sidebarOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [sidebarOpen, closeSidebar]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 md:hidden",
        sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!sidebarOpen}
    >
      <div
        onClick={closeSidebar}
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200",
          sidebarOpen ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={cn(
          "absolute inset-y-0 left-0 w-64 max-w-[80%] border-r bg-background shadow-xl transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <SidebarNav userEmail={userEmail} onNavigate={closeSidebar} />
      </aside>
    </div>
  );
}
