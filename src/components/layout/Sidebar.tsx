import { SidebarNav } from "@/components/layout/SidebarNav";

interface SidebarProps {
  userEmail?: string | null;
}

export function Sidebar({ userEmail }: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r bg-background md:flex md:flex-col"
    >
      <SidebarNav userEmail={userEmail} />
    </aside>
  );
}
