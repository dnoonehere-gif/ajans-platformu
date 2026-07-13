"use client";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Genel Bakış",
  "/dashboard/website": "Website Builder",
  "/dashboard/chatbot": "Chatbot",
  "/dashboard/google": "Google Business",
  "/dashboard/reviews": "Yorum Analizi",
  "/dashboard/content": "İçerik Üreticisi",
  "/dashboard/menu": "Dijital Menü",
  "/dashboard/qr": "QR Geri Bildirim",
  "/dashboard/subeler": "Şubeler",
  "/dashboard/team": "Takım",
  "/dashboard/seo": "SEO Araçları",
  "/dashboard/email-kampanya": "E-posta Pazarlama",
  "/dashboard/crm": "CRM & Pipeline",
  "/dashboard/batch-content": "Toplu İçerik",
  "/dashboard/sosyal-medya": "Sosyal Medya",
  "/dashboard/raporlar": "Müşteri Raporları",
  "/dashboard/white-label": "White-Label",
  "/dashboard/abonelik": "Abonelik",
  "/dashboard/ayarlar": "Ayarlar",
  "/dashboard/marka-olustur": "Marka Oluştur",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const label = PAGE_LABELS[pathname];

  if (!label || pathname === "/dashboard") return null;

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
      <span>Dashboard</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-medium text-[hsl(var(--foreground))]">{label}</span>
    </div>
  );
}
