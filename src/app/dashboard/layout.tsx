import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Globe, Bot, Star, Sparkles, QrCode,
  Users, Settings, LogOut, Shield, ChevronRight, Building2, MapPin, CreditCard, Palette, UtensilsCrossed,
} from "lucide-react";
import { BrandProvider } from "@/components/dashboard/brand-provider";
import { BrandSwitcher } from "@/components/dashboard/brand-switcher";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { ThemeSwitcher } from "@/components/dashboard/theme-switcher";
import { signOut } from "@/server/auth/auth";

const NAV = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/website", label: "Website Builder", icon: Globe },
  { href: "/dashboard/chatbot", label: "Chatbot", icon: Bot },
  { href: "/dashboard/google", label: "Google Business", icon: MapPin },
  { href: "/dashboard/reviews", label: "Yorum Analizi", icon: Star },
  { href: "/dashboard/content", label: "İçerik Üreticisi", icon: Sparkles },
  { href: "/dashboard/menu", label: "Dijital Menü", icon: UtensilsCrossed },
  { href: "/dashboard/qr", label: "QR Geri Bildirim", icon: QrCode },
  { href: "/dashboard/subeler", label: "Şubeler", icon: Building2 },
  { href: "/dashboard/team", label: "Takım", icon: Users },
  { href: "/dashboard/abonelik", label: "Abonelik", icon: CreditCard },
  { href: "/dashboard/ayarlar", label: "Ayarlar", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const user = session.user as { name?: string | null; email?: string | null; role?: string };
  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "ADMIN";
  const initials = (user.name ?? user.email ?? "K").slice(0, 2).toUpperCase();

  return (
    <BrandProvider>
      <div className="flex min-h-screen bg-[hsl(var(--background))]">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">

          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--border))] px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <span className="text-sm font-black text-white">A</span>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Ajans Platformu</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Dashboard</p>
            </div>
          </div>

          {/* Marka seçici */}
          <div className="border-b border-[hsl(var(--border))] p-3">
            <BrandSwitcher />
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight className="h-3 w-3 opacity-0 transition group-hover:opacity-40" />
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
              >
                <Shield className="h-4 w-4 shrink-0 text-purple-400" />
                <span className="flex-1">Admin Panel</span>
                <ChevronRight className="h-3 w-3 opacity-0 transition group-hover:opacity-40" />
              </Link>
            )}
          </nav>

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
              <form action={async () => { "use server"; await signOut({ redirectTo: "/giris" }); }}>
                <button type="submit" title="Çıkış Yap" className="text-[hsl(var(--muted-foreground))] transition hover:text-red-400">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* İçerik */}
        <main className="ml-64 flex-1 min-h-screen overflow-auto">
          {/* Topbar */}
          <div className="sticky top-0 z-30 flex h-14 items-center justify-end border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] px-6 backdrop-blur">
            <NotificationBell />
          </div>
          {children}
        </main>
      </div>
    </BrandProvider>
  );
}
