"use client";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useLang } from "@/components/language-provider";

// Yol → sidebar sözlük anahtarı (dictionaries.ts sidebar.*)
const PAGE_KEYS: Record<string, string> = {
  "/dashboard": "overview",
  "/dashboard/website": "websiteBuilder",
  "/dashboard/chatbot": "chatbot",
  "/dashboard/google": "googleBusiness",
  "/dashboard/reviews": "reviewAnalysis",
  "/dashboard/content": "contentGenerator",
  "/dashboard/menu": "digitalMenu",
  "/dashboard/qr": "qrFeedback",
  "/dashboard/subeler": "branches",
  "/dashboard/team": "team",
  "/dashboard/seo": "seoTools",
  "/dashboard/email-kampanya": "emailMarketing",
  "/dashboard/crm": "crm",
  "/dashboard/batch-content": "batchContent",
  "/dashboard/sosyal-medya": "socialMedia",
  "/dashboard/raporlar": "clientReports",
  "/dashboard/white-label": "whiteLabel",
  "/dashboard/abonelik": "subscription",
  "/dashboard/faturalar": "invoices",
  "/dashboard/ayarlar": "settings",
};

const EXTRA_LABELS: Record<string, { tr: string; en: string }> = {
  "/dashboard/marka-olustur": { tr: "Marka Oluştur", en: "Create Brand" },
};

export function Breadcrumb() {
  const pathname = usePathname();
  const { t, lang } = useLang();

  const key = PAGE_KEYS[pathname];
  const extra = EXTRA_LABELS[pathname];
  const label = key ? t(`sidebar.${key}`) : extra ? extra[lang] : null;

  if (!label || pathname === "/dashboard") return null;

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
      <span>Dashboard</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-medium text-[hsl(var(--foreground))]">{label}</span>
    </div>
  );
}
