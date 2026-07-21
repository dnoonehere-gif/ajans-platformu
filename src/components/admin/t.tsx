"use client";
import { useLang } from "@/components/language-provider";

/**
 * Admin sayfaları server component olduğu için useLang kullanamıyor.
 * Bu küçük client bileşeni ile sabit metinler çevrilebilir: <T k="users" />
 */
const DICT = {
  tr: {
    // Ortak
    all: "Tümü", active: "Aktif", passive: "Pasif", pending: "Bekliyor",
    verified: "Doğrulandı", createdAt: "Kayıt", created: "Oluşturuldu",
    total: "Toplam", brand: "Marka", brands: "Markalar", content: "İçerik",
    website: "Website", chatbot: "Chatbot", owner: "Sahibi", member: "Üye",
    review: "Yorum", requests: "İstek", feature: "Özellik",
    // Roller
    superAdmin: "Süper Admin", admin: "Admin", customer: "Müşteri", staff: "Personel",
    role: "Rol", membership: "Üyelik", status: "Durum",
    // Abonelik
    subscription: "Abonelik", trial: "Deneme", pastDue: "Gecikmiş",
    canceled: "İptal", expired: "Sona Erdi",
    // Genel bakış
    overview: "Genel Bakış", overviewSub: "Platform geneli istatistikler",
    user: "Kullanıcı", users: "Kullanıcılar", activeSub: "Aktif Abonelik",
    chatbotConv: "Chatbot Konuşma", aiCost: "AI Maliyet (₺)",
    aiSummary: "AI Kullanım Özeti",
    // Kullanıcılar
    usersSub: (n: number) => `Toplam ${n} kullanıcı`,
    // Ödemeler
    payments: "Ödemeler", paymentsSub: "Fatura ve ödeme geçmişi",
    paid: "Ödendi", failed: "Başarısız", refunded: "İade",
    provider: "Sağlayıcı", paidAt: "Ödeme Tarihi", amount: "Tutar",
    // AI
    aiUsage: "AI Kullanımı", contentGen: "İçerik Üretici", dashboardSummary: "Dashboard Özeti",
    totalRequests: "Toplam İstek", inputToken: "Giriş Token",
    token: "Token", cost: "Maliyet", model: "Model",
    totalToken: "Toplam Token", totalCost: "Toplam Maliyet",
    aiUsageSub: "Token tüketimi ve maliyet takibi", byFeature: "Özelliğe Göre Kullanım", byModel: "Modele Göre Kullanım",
    // Chatbot
    allBrandChatbots: "Tüm marka chatbotları", totalConv: "Toplam Konuşma",
    chatbotName: "Chatbot Adı", knowledgeBase: "Bilgi Tabanı", conversation: "Konuşma",
    // Paketler
    plans: "Paketler", planName: "Paket Adı", startingAt: "Başlangıç",
    trialDays: "Deneme Süresi (gün)",
    // Loglar
    systemLogs: "Sistem Logları", searchLogs: "Kullanıcı, eylem, entity...",
    justNow: "az önce", team: "Takım",
    noData: "Henüz veri yok", noChatbot: "Henüz chatbot yok", noPayment: "Henüz ödeme yok",
    published: "Yayında", records: "kayıt", inOutToken: "Giriş / Çıkış Token",
    recentUsers: "Son Kullanıcılar", recentBrands: "Son Markalar", seeAll: "Tümünü gör →",
  },
  en: {
    all: "All", active: "Active", passive: "Inactive", pending: "Pending",
    verified: "Verified", createdAt: "Joined", created: "Created",
    total: "Total", brand: "Brand", brands: "Brands", content: "Content",
    website: "Website", chatbot: "Chatbot", owner: "Owner", member: "Members",
    review: "Reviews", requests: "Requests", feature: "Feature",
    superAdmin: "Super Admin", admin: "Admin", customer: "Customer", staff: "Staff",
    role: "Role", membership: "Memberships", status: "Status",
    subscription: "Subscription", trial: "Trial", pastDue: "Past Due",
    canceled: "Canceled", expired: "Expired",
    overview: "Overview", overviewSub: "Platform-wide statistics",
    user: "Users", users: "Users", activeSub: "Active Subscriptions",
    chatbotConv: "Chatbot Conversations", aiCost: "AI Cost (₺)",
    aiSummary: "AI Usage Summary",
    usersSub: (n: number) => `${n} users in total`,
    payments: "Payments", paymentsSub: "Invoice and payment history",
    paid: "Paid", failed: "Failed", refunded: "Refunded",
    provider: "Provider", paidAt: "Payment Date", amount: "Amount",
    aiUsage: "AI Usage", contentGen: "Content Generator", dashboardSummary: "Dashboard Summary",
    totalRequests: "Total Requests", inputToken: "Input Tokens",
    token: "Tokens", cost: "Cost", model: "Model",
    totalToken: "Total Tokens", totalCost: "Total Cost",
    aiUsageSub: "Token consumption and cost tracking", byFeature: "Usage by Feature", byModel: "Usage by Model",
    allBrandChatbots: "All brand chatbots", totalConv: "Total Conversations",
    chatbotName: "Chatbot Name", knowledgeBase: "Knowledge Base", conversation: "Conversations",
    plans: "Plans", planName: "Plan Name", startingAt: "Starting At",
    trialDays: "Trial Period (days)",
    systemLogs: "System Logs", searchLogs: "User, action, entity...",
    justNow: "just now", team: "Team",
    noData: "No data yet", noChatbot: "No chatbots yet", noPayment: "No payments yet",
    published: "Published", records: "records", inOutToken: "Input / Output Tokens",
    recentUsers: "Recent Users", recentBrands: "Recent Brands", seeAll: "See all →",
  },
};

export type AdminKey = keyof typeof DICT.tr;

/** Sabit metin çevirisi. Sayı alan anahtarlar için `n` verilir. */
export function T({ k, n }: { k: AdminKey; n?: number }) {
  const { lang } = useLang();
  const v = DICT[lang][k];
  return <>{typeof v === "function" ? v(n ?? 0) : v}</>;
}

/** Attribute (placeholder vb.) için string döndüren hook. */
export function useAdminT() {
  const { lang } = useLang();
  return (k: AdminKey, n?: number) => {
    const v = DICT[lang][k];
    return typeof v === "function" ? v(n ?? 0) : v;
  };
}
