import { auth } from "@/server/auth/auth";
import { LogoMark } from "@/components/logo";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--border))] px-5">
          <LogoMark size={32} />
          <div>
            <p className="text-sm font-bold">Novelya</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Admin Panel</p>
          </div>
        </div>

        <AdminNav />
      </aside>

      {/* Content */}
      <main className="ml-60 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
