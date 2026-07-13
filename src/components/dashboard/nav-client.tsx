"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Bot, Star, Sparkles, QrCode,
  Users, Settings, Shield, ChevronRight, Building2, MapPin, CreditCard,
  UtensilsCrossed, Lock, Crown, Layers, FileBarChart, Send,
  Search, Mail, UserPlus, Receipt,
} from "lucide-react";
import { useBrand } from "./brand-provider";

interface PlanFeatures {
  chatbot: boolean;
  reviews: boolean;
  website: boolean;
  googleBusiness: boolean;
  seoContent: boolean;
  whiteLabel?: boolean;
  batchContent?: boolean;
  clientReporting?: boolean;
  socialMedia?: boolean;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  planKey?: keyof PlanFeatures;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "Genel Bakış", icon: LayoutDashboard },
    ],
  },
  {
    label: "Dijital Varlıklar",
    items: [
      { href: "/dashboard/website", label: "Website Builder", icon: Globe, planKey: "website" },
      { href: "/dashboard/chatbot", label: "Chatbot", icon: Bot, planKey: "chatbot" },
      { href: "/dashboard/menu", label: "Dijital Menü", icon: UtensilsCrossed },
    ],
  },
  {
    label: "Pazarlama",
    items: [
      { href: "/dashboard/content", label: "İçerik Üreticisi", icon: Sparkles },
      { href: "/dashboard/batch-content", label: "Toplu İçerik", icon: Layers, planKey: "batchContent" as keyof PlanFeatures },
      { href: "/dashboard/sosyal-medya", label: "Sosyal Medya", icon: Send, planKey: "socialMedia" as keyof PlanFeatures },
      { href: "/dashboard/email-kampanya", label: "E-posta Pazarlama", icon: Mail },
      { href: "/dashboard/seo", label: "SEO Araçları", icon: Search, planKey: "seoContent" as keyof PlanFeatures },
    ],
  },
  {
    label: "Müşteri Yönetimi",
    items: [
      { href: "/dashboard/google", label: "Google Business", icon: MapPin, planKey: "googleBusiness" },
      { href: "/dashboard/reviews", label: "Yorum Analizi", icon: Star, planKey: "reviews" },
      { href: "/dashboard/qr", label: "QR Geri Bildirim", icon: QrCode },
      { href: "/dashboard/crm", label: "CRM & Pipeline", icon: UserPlus },
    ],
  },
  {
    label: "Ajans",
    items: [
      { href: "/dashboard/raporlar", label: "Müşteri Raporları", icon: FileBarChart, planKey: "clientReporting" as keyof PlanFeatures },
      { href: "/dashboard/white-label", label: "White-Label", icon: Crown, planKey: "whiteLabel" as keyof PlanFeatures },
    ],
  },
  {
    label: "",
    items: [
      { href: "/dashboard/subeler", label: "Şubeler", icon: Building2 },
      { href: "/dashboard/team", label: "Takım", icon: Users },
      { href: "/dashboard/abonelik", label: "Abonelik", icon: CreditCard },
      { href: "/dashboard/faturalar", label: "Faturalar", icon: Receipt },
      { href: "/dashboard/ayarlar", label: "Ayarlar", icon: Settings },
    ],
  },
];

export function NavClient({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const { activeBrand } = useBrand();
  const [features, setFeatures] = useState<PlanFeatures | null>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!activeBrand) return;
    fetch(`/api/plan/features?brandId=${activeBrand.id}`)
      .then((r) => r.json())
      .then((d) => d.features && setFeatures(d.features))
      .catch(() => null);
  }, [activeBrand?.id]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [pathname]);

  function renderItem(item: NavItem) {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
    const locked = item.planKey && features ? !features[item.planKey] : false;

    if (locked) {
      return (
        <Link
          key={item.href}
          href="/dashboard/abonelik"
          title={`${item.label} — Planınıza dahil değil`}
          className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground)/0.5)] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--muted-foreground))]"
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
        ref={isActive ? activeRef : undefined}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
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
  }

  return (
    <nav className="flex-1 overflow-y-auto p-3">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className={group.label ? "mt-4 first:mt-0" : ""}>
          {group.label && (
            <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.6)]">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map(renderItem)}
          </div>
        </div>
      ))}
      {isAdmin && (
        <div className="mt-4">
          <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.6)]">
            Yönetim
          </p>
          <Link
            href="/admin"
            className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
          >
            <Shield className="h-4 w-4 shrink-0 text-purple-400" />
            <span className="flex-1">Admin Panel</span>
            <ChevronRight className="h-3 w-3 opacity-0 transition group-hover:opacity-40" />
          </Link>
        </div>
      )}
    </nav>
  );
}
