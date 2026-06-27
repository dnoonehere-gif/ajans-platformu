import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Building2, Package, CreditCard, Brain, Bot, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Users },
  { href: "/admin/markalar", label: "Markalar", icon: Building2 },
  { href: "/admin/paketler", label: "Paketler", icon: Package },
  { href: "/admin/odemeler", label: "Ödemeler", icon: CreditCard },
  { href: "/admin/ai", label: "AI Kullanımı", icon: Brain },
  { href: "/admin/chatbot", label: "Chatbot", icon: Bot },
];

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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <span className="text-sm font-black text-white">A</span>
          </div>
          <div>
            <p className="text-sm font-bold">Ajans Platformu</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] [&.active]:bg-[hsl(var(--primary)/0.12)] [&.active]:text-[hsl(var(--primary))]"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[hsl(var(--border))] p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
          >
            <LogOut className="h-4 w-4" />
            Dashboard'a Dön
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-60 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
