"use client";
import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/components/language-provider";
import {
  Search, Loader2, ChevronDown, Shield, RefreshCw,
  LogIn, UserPlus, Building2, CreditCard, Star, Sparkles,
  Bot, Users, Globe, QrCode, Mail, Bell, Trash2, Settings,
} from "lucide-react";

interface LogUser {
  id: string; name: string | null; email: string; globalRole: string;
}
interface Log {
  id: string; action: string; entity: string | null; entityId: string | null;
  metadata: Record<string, unknown> | null; ip: string | null; createdAt: string;
  user: LogUser | null;
}


// Eylem etiketleri (ACTION_META.labelTr'nin İngilizce karşılıkları)
const ACTION_EN: Record<string, string> = {
  "auth.login": "Login", "auth.logout": "Logout", "auth.register": "Register",
  "auth.password_reset_request": "Password Request", "auth.password_reset": "Password Reset",
  "auth.email_verify": "Email Verify", "brand.create": "Brand Created",
  "brand.update": "Brand Updated", "brand.delete": "Brand Deleted",
  "subscription.create": "Subscription Started", "subscription.cancel": "Subscription Canceled",
  "subscription.activate": "Subscription Active", "review.create": "Review Added",
  "review.delete": "Review Deleted", "review.analyze": "Review Analyzed",
  "content.generate": "Content Generated", "content.delete": "Content Deleted",
  "chatbot.update": "Chatbot Updated", "chatbot.knowledge_add": "Knowledge Added",
  "chatbot.knowledge_delete": "Knowledge Deleted", "team.invite": "Team Invite",
  "team.remove": "Team Removed", "website.generate": "Website Generated",
  "website.publish": "Website Published", "qr.create": "QR Created",
  "admin.mail_send": "Mail Sent", "admin.notification_send": "Notification Sent",
  "admin.user_delete": "User Deleted", "user.role_change": "Role Changed",
};

const L = {
  tr: {
    title: "Sistem Logları", sub: "{sL.sub}",
    refresh: "Yenile", searchPh: "Kullanıcı, eylem, entity...",
    notFound: "Log bulunamadı", user: "Kullanıcı", loadMore: "Daha fazla yükle",
    all: "Tümü", brand: "Marka", subscription: "Abonelik", review: "Yorum",
    content: "İçerik", team: "Takım",
    justNow: "az önce", minAgo: (n: number) => `${n}dk önce`, hourAgo: (n: number) => `${n} saat önce`,
  },
  en: {
    title: "System Logs", sub: "Who did what — everything is logged",
    refresh: "Refresh", searchPh: "User, action, entity...",
    notFound: "No logs found", user: "User", loadMore: "Load more",
    all: "All", brand: "Brand", subscription: "Subscription", review: "Review",
    content: "Content", team: "Team",
    justNow: "just now", minAgo: (n: number) => `${n}m ago`, hourAgo: (n: number) => `${n}h ago`,
  },
};

const ACTION_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; labelTr: string }> = {
  "auth.login":                  { icon: LogIn,      color: "text-blue-400 bg-blue-500/10",    labelTr: "Giriş" },
  "auth.logout":                 { icon: LogIn,      color: "text-slate-400 bg-slate-500/10",  labelTr: "Çıkış" },
  "auth.register":               { icon: UserPlus,   color: "text-green-400 bg-green-500/10",  labelTr: "Kayıt" },
  "auth.password_reset_request": { icon: Shield,     color: "text-orange-400 bg-orange-500/10",labelTr: "Şifre İsteği" },
  "auth.password_reset":         { icon: Shield,     color: "text-orange-400 bg-orange-500/10",labelTr: "Şifre Sıfırla" },
  "auth.email_verify":           { icon: Shield,     color: "text-teal-400 bg-teal-500/10",    labelTr: "Mail Doğrula" },
  "brand.create":                { icon: Building2,  color: "text-violet-400 bg-violet-500/10",labelTr: "Marka Oluştur" },
  "brand.update":                { icon: Building2,  color: "text-violet-400 bg-violet-500/10",labelTr: "Marka Güncelle" },
  "brand.delete":                { icon: Trash2,     color: "text-red-400 bg-red-500/10",      labelTr: "Marka Sil" },
  "subscription.create":         { icon: CreditCard, color: "text-emerald-400 bg-emerald-500/10", labelTr: "Abonelik Başlat" },
  "subscription.cancel":         { icon: CreditCard, color: "text-red-400 bg-red-500/10",      labelTr: "Abonelik İptal" },
  "subscription.activate":       { icon: CreditCard, color: "text-green-400 bg-green-500/10",  labelTr: "Abonelik Aktif" },
  "review.create":               { icon: Star,       color: "text-yellow-400 bg-yellow-500/10",labelTr: "Yorum Ekle" },
  "review.delete":               { icon: Trash2,     color: "text-red-400 bg-red-500/10",      labelTr: "Yorum Sil" },
  "review.analyze":              { icon: Star,       color: "text-yellow-400 bg-yellow-500/10",labelTr: "Yorum Analiz" },
  "content.generate":            { icon: Sparkles,   color: "text-purple-400 bg-purple-500/10",labelTr: "İçerik Üret" },
  "content.delete":              { icon: Trash2,     color: "text-red-400 bg-red-500/10",      labelTr: "İçerik Sil" },
  "chatbot.update":              { icon: Bot,        color: "text-cyan-400 bg-cyan-500/10",    labelTr: "Chatbot Güncelle" },
  "chatbot.knowledge_add":       { icon: Bot,        color: "text-cyan-400 bg-cyan-500/10",    labelTr: "Bilgi Ekle" },
  "chatbot.knowledge_delete":    { icon: Trash2,     color: "text-red-400 bg-red-500/10",      labelTr: "Bilgi Sil" },
  "team.invite":                 { icon: Users,      color: "text-indigo-400 bg-indigo-500/10",labelTr: "Takım Davet" },
  "team.remove":                 { icon: Users,      color: "text-red-400 bg-red-500/10",      labelTr: "Takım Çıkar" },
  "website.generate":            { icon: Globe,      color: "text-teal-400 bg-teal-500/10",    labelTr: "Website Üret" },
  "website.publish":             { icon: Globe,      color: "text-green-400 bg-green-500/10",  labelTr: "Website Yayınla" },
  "qr.create":                   { icon: QrCode,     color: "text-pink-400 bg-pink-500/10",    labelTr: "QR Oluştur" },
  "admin.mail_send":             { icon: Mail,       color: "text-orange-400 bg-orange-500/10",labelTr: "Mail Gönder" },
  "admin.notification_send":     { icon: Bell,       color: "text-orange-400 bg-orange-500/10",labelTr: "Bildirim Gönder" },
  "admin.user_delete":           { icon: Trash2,     color: "text-red-400 bg-red-500/10",      labelTr: "Kullanıcı Sil" },
  "user.role_change":            { icon: Settings,   color: "text-blue-400 bg-blue-500/10",    labelTr: "Rol Değiştir" },
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "text-purple-400 bg-purple-500/10",
  ADMIN: "text-blue-400 bg-blue-500/10",
  CUSTOMER: "text-green-400 bg-green-500/10",
  STAFF: "text-yellow-400 bg-yellow-500/10",
};

function timeAgo(date: string, sL: (typeof L)["tr"], lang: "tr" | "en") {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return sL.justNow;
  if (m < 60) return sL.minAgo(m);
  const h = Math.floor(m / 60);
  if (h < 24) return sL.hourAgo(h);
  return new Date(date).toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function LoglarPage() {
  const { lang } = useLang();
  const sL = L[lang];
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ limit: "50" });
    if (search) params.set("search", search);
    if (actionFilter) params.set("action", actionFilter);
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/admin/logs?${params}`);
    return res.json() as Promise<{ logs: Log[]; nextCursor: string | null }>;
  }, [search, actionFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchLogs();
    setLogs(data.logs);
    setNextCursor(data.nextCursor);
    setLoading(false);
  }, [fetchLogs]);

  useEffect(() => { load(); }, [load]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    const data = await fetchLogs(nextCursor);
    setLogs((prev) => [...prev, ...data.logs]);
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }

  const ACTION_GROUPS = [
    { label: sL.all, value: "" },
    { label: "Auth", value: "auth." },
    { label: sL.brand, value: "brand." },
    { label: sL.subscription, value: "subscription." },
    { label: sL.review, value: "review." },
    { label: sL.content, value: "content." },
    { label: "Chatbot", value: "chatbot." },
    { label: sL.team, value: "team." },
    { label: "Admin", value: "admin." },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{sL.title}</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{sL.sub}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
          <RefreshCw className="h-4 w-4" /> {sL.refresh}
        </button>
      </div>

      {/* Filtreler */}
      <div className="mb-6 flex flex-wrap gap-3">
        {/* Arama */}
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}
          className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2">
          <Search className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder={sL.searchPh}
            className="w-56 bg-transparent text-sm focus:outline-none" />
        </form>

        {/* Action grup filtreleri */}
        <div className="flex flex-wrap gap-1.5">
          {ACTION_GROUPS.map((g) => (
            <button key={g.value} onClick={() => setActionFilter(
              actionFilter === g.value && g.value ? "" : g.value
            )}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                actionFilter === g.value
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]"
              }`}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tablo */}
      <div className="glass rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-[hsl(var(--muted-foreground))]">
            {sL.notFound}
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]">
            {/* Header */}
            <div className="grid grid-cols-[36px_180px_1fr_140px_100px_80px] gap-3 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              <div />
              <div>Eylem</div>
              <div>{sL.user}</div>
              <div>Entity</div>
              <div>IP</div>
              <div>Zaman</div>
            </div>

            {logs.map((log) => {
              const meta = ACTION_META[log.action];
              const Icon = meta?.icon ?? Shield;
              const isExpanded = expandedId === log.id;

              return (
                <div key={log.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="grid w-full grid-cols-[36px_180px_1fr_140px_100px_80px] gap-3 px-4 py-3 text-left text-sm transition hover:bg-[hsl(var(--accent)/0.4)]"
                  >
                    {/* Icon */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${meta?.color ?? "text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]"}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate font-medium text-xs">{(lang === "en" ? (ACTION_EN[log.action] ?? meta?.labelTr) : meta?.labelTr) ?? log.action}</span>
                      {log.metadata && (
                        <ChevronDown className={`h-3 w-3 shrink-0 text-[hsl(var(--muted-foreground))] transition ${isExpanded ? "rotate-180" : ""}`} />
                      )}
                    </div>

                    {/* User */}
                    <div className="flex items-center gap-2 min-w-0">
                      {log.user ? (
                        <>
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-[9px] font-bold text-[hsl(var(--primary))]">
                            {(log.user.name ?? log.user.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">{log.user.name ?? "—"}</p>
                            <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">{log.user.email}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${ROLE_COLORS[log.user.globalRole] ?? ""}`}>
                            {log.user.globalRole === "SUPER_ADMIN" ? "SA" : log.user.globalRole === "ADMIN" ? "A" : log.user.globalRole === "CUSTOMER" ? "M" : "P"}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">Sistem</span>
                      )}
                    </div>

                    {/* Entity */}
                    <div className="flex items-center min-w-0">
                      {log.entity ? (
                        <div className="min-w-0">
                          <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{log.entity}</p>
                          <p className="truncate font-mono text-[10px] text-[hsl(var(--muted-foreground)/0.6)]">{log.entityId?.slice(0, 12)}…</p>
                        </div>
                      ) : <span className="text-xs text-[hsl(var(--muted-foreground)/0.4)]">—</span>}
                    </div>

                    {/* IP */}
                    <div className="flex items-center">
                      <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{log.ip ?? "—"}</span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center">
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{timeAgo(log.createdAt, sL, lang)}</span>
                    </div>
                  </button>

                  {/* Expanded metadata */}
                  {isExpanded && log.metadata && (
                    <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] px-16 py-3">
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Metadata</p>
                      <pre className="overflow-x-auto rounded-lg bg-[hsl(var(--background))] p-3 font-mono text-[11px] text-[hsl(var(--foreground)/0.8)]">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                      <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                        {new Date(log.createdAt).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "medium" })}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {nextCursor && !loading && (
          <div className="border-t border-[hsl(var(--border))] px-4 py-3 text-center">
            <button onClick={loadMore} disabled={loadingMore}
              className="flex items-center gap-2 mx-auto text-sm text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]">
              {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {sL.loadMore}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
