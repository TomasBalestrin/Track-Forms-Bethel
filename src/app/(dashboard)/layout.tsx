import { redirect } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { Sidebar } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userEmail = user.email ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar userEmail={userEmail} />
      <MobileDrawer userEmail={userEmail} />
      <div className="flex min-h-screen flex-col md:pl-60">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
