"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Bot, Star, Sparkles, QrCode,
  Users, Settings, Shield, ChevronRight, Building2, MapPin, CreditCard,
  UtensilsCrossed, Lock,
} from "lucide-react";
import { useBrand } from "./brand-provider";

interface PlanFeatures {
  chatbot: boolean;
  reviews: boolean;
  website: boolean;
  googleBusiness: boolean;
  seoContent: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  planKey?: keyof PlanFeatures;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/dashboard/website", label: "Website Builder", icon: Globe, planKey: "website" },
  { href: "/dashboard/chatbot", label: "Chatbot", icon: Bot, planKey: "chatbot" },
  { href: "/dashboard/google", label: "Google Business", icon: MapPin, planKey: "googleBusiness" },
  { href: "/dashboard/reviews", label: "Yorum Analizi", icon: Star, planKey: "reviews" },
  { href: "/dashboard/content", label: "İçerik Üreticisi", icon: Sparkles },
  { href: "/dashboard/menu", label: "Dijital Menü", icon: UtensilsCrossed },
  { href: "/dashboard/qr", label: "QR Geri Bildirim", icon: QrCode },
  { href: "/dashboard/subeler", label: "Şubeler", icon: Building2 },
  { href: "/dashboard/team", label: "Takım", icon: Users },
  { href: "/dashboard/abonelik", label: "Abonelik", icon: CreditCard },
  { href: "/dashboard/ayarlar", label: "Ayarlar", icon: Settings },
];

export function NavClient({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { activeBrand } = useBrand();
  const [features, setFeatures] = useState<PlanFeatures | null>(null);

  useEffect(() => {
    if (!activeBrand) return;
    fetch(`/api/plan/features?brandId=${activeBrand.id}`)
      .then((r) => r.json())
      .then((d) => d.features && setFeatures(d.features))
      .catch(() => null);
  }, [activeBrand?.id]);

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
      {NAV.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const locked = item.planKey && features ? !features[item.planKey] : false;

        if (locked) {
          return (
            <Link
              key={item.href}
              href="/dashboard/abonelik"
              title={`${item.label} — Planınıza dahil değil`}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground)/0.5)] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--muted-foreground))]"
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-50" />
              <span className="flex-1">{item.label}</span>
              <Lock className="h-3 w-3 opacity-60" />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[hsl(var(--primary))]" : ""}`} />
            <span className="flex-1">{item.label}</span>
            <ChevronRight className={`h-3 w-3 transition ${isActive ? "opacity-40" : "opacity-0 group-hover:opacity-40"}`} />
          </Link>
        );
      })}
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
  );
}
