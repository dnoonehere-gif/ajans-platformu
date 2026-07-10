import { auth } from "@/server/auth/auth";
import { LogoMark } from "@/components/logo";
import { redirect } from "next/navigation";
import { LogOut, Palette, ChevronRight } from "lucide-react";
import { BrandProvider } from "@/components/dashboard/brand-provider";
import { BrandSwitcher } from "@/components/dashboard/brand-switcher";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeSwitcher } from "@/components/dashboard/theme-switcher";
import { NavClient } from "@/components/dashboard/nav-client";
import { SubscriptionBanner } from "@/components/dashboard/subscription-banner";
import { MobileSidebarToggle } from "@/components/dashboard/mobile-sidebar";
import { DashboardColorTheme } from "@/components/theme-provider";
import { signOut } from "@/server/auth/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const user = session.user as { name?: string | null; email?: string | null; role?: string };
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  const initials = (user.name ?? user.email ?? "K").slice(0, 2).toUpperCase();

  return (
    <BrandProvider>
      <DashboardColorTheme />
      <div className="flex min-h-screen bg-[hsl(var(--background))]">
        {/* Sidebar — masaüstü */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] lg:flex">

          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--border))] px-5">
            <LogoMark size={32} />
            <div>
              <p className="text-sm font-bold leading-tight">Novelya</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Dashboard</p>
            </div>
          </div>

          {/* Marka seçici */}
          <div className="border-b border-[hsl(var(--border))] p-3">
            <BrandSwitcher />
          </div>

          {/* Nav */}
          <NavClient isAdmin={isAdmin} />

          {/* Tema seçici */}
          <div className="border-t border-[hsl(var(--border))]">
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">
                <Palette className="h-4 w-4 shrink-0" />
                <span className="flex-1">Tema</span>
                <ChevronRight className="h-3 w-3 transition group-open:rotate-90" />
              </summary>
              <ThemeSwitcher />
            </details>
          </div>

          {/* Kullanıcı */}
          <div className="border-t border-[hsl(var(--border))] p-3">
            <div className="flex items-center gap-3 rounded-xl bg-[hsl(var(--accent)/0.5)] px-3 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.2)] text-xs font-bold text-[hsl(var(--primary))]">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold">{user.name ?? "Kullanıcı"}</p>
                <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">{user.email}</p>
              </div>
              <form action={async () => { "use server"; await signOut({ redirectTo: `${process.env.NEXTAUTH_URL ?? ""}/giris` }); }}>
                <button type="submit" title="Çıkış Yap" className="text-[hsl(var(--muted-foreground))] transition hover:text-red-400">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* İçerik */}
        <main className="flex-1 min-h-screen overflow-auto lg:ml-64">
          {/* Topbar */}
          <div className="sticky top-0 z-30 flex h-14 items-center border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] px-4 backdrop-blur gap-2">
            {/* Mobil hamburger + slide-in sidebar */}
            <MobileSidebarToggle>
              <div className="border-b border-[hsl(var(--border))] p-3">
                <BrandSwitcher />
              </div>
              <NavClient isAdmin={isAdmin} />
            </MobileSidebarToggle>
            <div className="ml-auto">
              <NotificationBell />
            </div>
          </div>
          <SubscriptionBanner />
          {children}
        </main>
      </div>
    </BrandProvider>
  );
}
