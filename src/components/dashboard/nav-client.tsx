"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Bot, Star, Sparkles, QrCode,
  Users, Settings, ChevronRight, Building2, MapPin, CreditCard,
  UtensilsCrossed, Lock, Crown, Layers, FileBarChart, Send,
  Search, Mail, UserPlus, Receipt, CalendarDays,
} from "lucide-react";
import { useBrand } from "./brand-provider";
import { useLang } from "@/components/language-provider";

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
  key?: string;
  icon: React.ElementType;
  planKey?: keyof PlanFeatures;
  /** Öğenin kendi kimlik rengi — üzerine gelince ikon bu renge döner. */
  accent?: string;
}

interface NavGroup {
  label: string;
  key?: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "Genel Bakış", key: "overview", icon: LayoutDashboard, accent: "#8b5cf6" },
    ],
  },
  {
    label: "Dijital Varlıklar", key: "digitalAssets",
    items: [
      { href: "/dashboard/website", label: "Website Builder", key: "websiteBuilder", icon: Globe, planKey: "website", accent: "#38bdf8" },
      { href: "/dashboard/chatbot", label: "Chatbot", key: "chatbot", icon: Bot, planKey: "chatbot", accent: "#22d3ee" },
      { href: "/dashboard/menu", label: "Dijital Menü", key: "digitalMenu", icon: UtensilsCrossed, accent: "#fb7185" },
    ],
  },
  {
    label: "Pazarlama", key: "marketing",
    items: [
      { href: "/dashboard/content", label: "İçerik Üreticisi", key: "contentGenerator", icon: Sparkles, accent: "#e879f9" },
      { href: "/dashboard/batch-content", label: "Toplu İçerik", key: "batchContent", icon: Layers, planKey: "batchContent" as keyof PlanFeatures, accent: "#818cf8" },
      { href: "/dashboard/sosyal-medya", label: "Sosyal Medya", key: "socialMedia", icon: Send, planKey: "socialMedia" as keyof PlanFeatures, accent: "#f472b6" },
      { href: "/dashboard/email-kampanya", label: "E-posta Pazarlama", key: "emailMarketing", icon: Mail, accent: "#fbbf24" },
      { href: "/dashboard/seo", label: "SEO Araçları", key: "seoTools", icon: Search, planKey: "seoContent" as keyof PlanFeatures, accent: "#4ade80" },
    ],
  },
  {
    label: "Müşteri Yönetimi", key: "customerMgmt",
    items: [
      { href: "/dashboard/google", label: "Google Business", key: "googleBusiness", icon: MapPin, planKey: "googleBusiness", accent: "#4285F4" },
      { href: "/dashboard/reviews", label: "Yorum Analizi", key: "reviewAnalysis", icon: Star, planKey: "reviews", accent: "#facc15" },
      { href: "/dashboard/qr", label: "QR Geri Bildirim", key: "qrFeedback", icon: QrCode, accent: "#fb923c" },
      { href: "/dashboard/crm", label: "CRM & Pipeline", key: "crm", icon: UserPlus, accent: "#a78bfa" },
      { href: "/dashboard/rezervasyonlar", label: "Rezervasyonlar", key: "rezervasyonlar", icon: CalendarDays, accent: "#22d3ee" },
    ],
  },
  {
    label: "Ajans", key: "agency",
    items: [
      { href: "/dashboard/raporlar", label: "Müşteri Raporları", key: "clientReports", icon: FileBarChart, planKey: "clientReporting" as keyof PlanFeatures, accent: "#c084fc" },
      { href: "/dashboard/white-label", label: "White-Label", key: "whiteLabel", icon: Crown, planKey: "whiteLabel" as keyof PlanFeatures, accent: "#f59e0b" },
    ],
  },
  {
    label: "Hesap", key: "account",
    items: [
      { href: "/dashboard/abonelik", label: "Abonelik", key: "subscription", icon: CreditCard, accent: "#34d399" },
      { href: "/dashboard/faturalar", label: "Faturalar", key: "invoices", icon: Receipt, accent: "#60a5fa" },
    ],
  },
  {
    label: "",
    items: [
      { href: "/dashboard/subeler", label: "Şubeler", key: "branches", icon: Building2, accent: "#2dd4bf" },
      { href: "/dashboard/team", label: "Takım", key: "team", icon: Users, accent: "#a855f7" },
      { href: "/dashboard/ayarlar", label: "Ayarlar", key: "settings", icon: Settings, accent: "#94a3b8" },
    ],
  },
];

export function NavClient({ rail = false }: { rail?: boolean } = {}) {
  const pathname = usePathname();
  const { activeBrand } = useBrand();
  const { t, lang } = useLang();
  const label = (item: { label: string; key?: string }) =>
    item.key ? t(`sidebar.${item.key}`) : item.label;
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
          title={`${label(item)} — Planınıza dahil değil`}
          className={`group/i flex items-center gap-0 group-hover:gap-3 rounded-2xl py-2.5 text-sm font-semibold text-[hsl(var(--muted-foreground)/0.5)] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--muted-foreground))] ${rail ? "w-full justify-center px-0 group-hover:justify-start group-hover:px-3" : "px-3"}`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent)/0.6)]">
            <item.icon className="h-4 w-4 opacity-50" />
          </span>
          <span className={`whitespace-nowrap transition-all duration-200 ${rail ? "w-0 overflow-hidden opacity-0 group-hover:w-auto group-hover:flex-1 group-hover:opacity-100" : "flex-1"}`}>{label(item)}</span>
          <Lock className={`h-3 shrink-0 transition-all duration-200 ${rail ? "w-0 opacity-0 group-hover:w-3 group-hover:opacity-60" : "w-3 opacity-60"}`} />
        </Link>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        ref={isActive ? activeRef : undefined}
        title={rail ? label(item) : undefined}
        className={`group/i flex items-center gap-0 group-hover:gap-3 rounded-2xl py-2.5 text-sm font-semibold transition ${
          rail ? "w-full justify-center px-0 group-hover:justify-start group-hover:px-3" : "px-3"
        } ${
          isActive
            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_8px_20px_-8px_hsl(var(--primary)/0.8)]"
            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
        }`}
      >
        {/* İkon çipi — aktifken saydam beyaz kapsül, referans tasarımdaki gibi */}
        <span
          style={!isActive && item.accent ? ({ "--nv-i": item.accent } as React.CSSProperties) : undefined}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
            isActive
              ? "bg-[hsl(var(--primary-foreground)/0.2)]"
              : "bg-[hsl(var(--accent))] group-hover/i:scale-110 group-hover/i:-rotate-6 nv-nav-icon"
          }`}
        >
          <item.icon className="h-4 w-4" />
        </span>
        <span className={`whitespace-nowrap transition-all duration-200 ${rail ? "w-0 overflow-hidden opacity-0 group-hover:w-auto group-hover:flex-1 group-hover:opacity-100" : "flex-1"}`}>{label(item)}</span>
        <ChevronRight className={`h-3 shrink-0 transition-all ${rail ? "w-0 opacity-0 group-hover:w-3 group-hover:opacity-70" : `w-3 ${isActive ? "opacity-70" : "opacity-0 group-hover/i:opacity-40"}`}`} />
      </Link>
    );
  }

  return (
    <nav className={`nv-no-scrollbar flex-1 overflow-y-auto overflow-x-hidden ${rail ? "p-2 group-hover:p-3" : "p-3"}`}>
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className={group.label ? "mt-4 first:mt-0" : ""}>
          {group.label && (
            <p className={`whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.6)] transition-all ${rail ? "mb-0 h-0 overflow-hidden opacity-0 group-hover:mb-1 group-hover:h-auto group-hover:opacity-100" : "mb-1"}`}>
              {group.key ? t(`sidebar.${group.key}`) : group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map(renderItem)}
          </div>
        </div>
      ))}
      {/* Yönetim paneli bağlantısı KASITLI olarak gösterilmiyor.
          Panele yalnızca doğrudan gizli URL ile gidilir ve middleware
          SUPER_ADMIN/ADMIN rolü ister — linki bilmek tek başına yetmez. */}
    </nav>
  );
}
