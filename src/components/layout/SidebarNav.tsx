"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Radio, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";

const NAV_ITEMS = [{ href: "/pixels", label: "Pixels", icon: Radio }];

interface SidebarNavProps {
  userEmail?: string | null;
  onNavigate?: () => void;
}

export function SidebarNav({ userEmail, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const closeSidebar = useUIStore((s) => s.closeSidebar);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    closeSidebar();
    router.push("/login");
    router.refresh();
  }

  function handleClick() {
    onNavigate?.();
    closeSidebar();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-5">
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
      <Separator />

      <nav aria-label="Navegação principal" className="flex-1 px-2 py-4">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={handleClick}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />
      <div className="flex flex-col gap-2 px-4 py-4">
        {userEmail ? (
          <p
            className="truncate text-xs text-muted-foreground"
            title={userEmail}
          >
            {userEmail}
          </p>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="justify-start"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sair
        </Button>
      </div>
    </div>
  );
}
