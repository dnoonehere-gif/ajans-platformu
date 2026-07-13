"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, CheckCheck, Loader2, X } from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";

interface NotificationData {
  type?: string;
  icon?: string;
  [key: string]: unknown;
}

interface Notification {
  id: string;
  title: string;
  body: string | null;
  status: "UNREAD" | "READ";
  data: NotificationData | null;
  createdAt: string;
  brandId: string | null;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa önce`;
  return `${Math.floor(h / 24)}g önce`;
}

const TYPE_BG: Record<string, string> = {
  new_review: "bg-yellow-500/10",
  negative_review: "bg-red-500/10",
  ai_content_ready: "bg-violet-500/10",
  subscription_started: "bg-green-500/10",
  subscription_canceled: "bg-red-500/10",
  subscription_expiring: "bg-orange-500/10",
  team_invite: "bg-blue-500/10",
  chatbot_limit: "bg-cyan-500/10",
  crm_lead_new: "bg-indigo-500/10",
  crm_lead_won: "bg-emerald-500/10",
  reservation_new: "bg-sky-500/10",
  reservation_confirmed: "bg-green-500/10",
  email_campaign_sent: "bg-amber-500/10",
  social_post_published: "bg-pink-500/10",
  system: "bg-[hsl(var(--muted))]",
};

export function NotificationBell() {
  const { activeBrand } = useBrand();
  const brandId = activeBrand?.id;

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const evtRef = useRef<EventSource | null>(null);

  // SSE — unread count
  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");
    evtRef.current = es;
    es.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (typeof d.unreadCount === "number") setUnread(d.unreadCount);
    };
    return () => es.close();
  }, []);

  const fetchNotifications = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ limit: "15" });
    if (brandId) params.set("brandId", brandId);
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/notifications?${params}`);
    const data = await res.json();
    return data as { notifications: Notification[]; unreadCount: number; nextCursor: string | null };
  }, [brandId]);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotifications();
    setItems(data.notifications);
    setUnread(data.unreadCount);
    setNextCursor(data.nextCursor);
    setLoading(false);
  }, [fetchNotifications]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Dışarı tıklanınca kapat
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function loadMore() {
    if (!nextCursor) return;
    setLoadingMore(true);
    const data = await fetchNotifications(nextCursor);
    setItems((prev) => [...prev, ...data.notifications]);
    setNextCursor(data.nextCursor);
    setLoadingMore(false);
  }

  async function markRead(id?: string) {
    setMarking(true);
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : {}),
    });
    setItems((prev) =>
      prev.map((n) => (!id || n.id === id) ? { ...n, status: "READ" } : n)
    );
    setUnread(id ? Math.max(0, unread - 1) : 0);
    setMarking(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[hsl(var(--border))] transition hover:bg-[hsl(var(--accent))]"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl shadow-black/20">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Bildirimler</p>
              {unread > 0 && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">{unread} yeni</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={() => markRead()}
                  disabled={marking}
                  title="Tümünü okundu yap"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
                >
                  <CheckCheck className="h-3 w-3" /> Tümü
                </button>
              )}
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-center">
                <Bell className="h-8 w-8 text-[hsl(var(--muted-foreground)/0.3)]" />
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Henüz bildirim yok</p>
              </div>
            ) : (
              <div className="divide-y divide-[hsl(var(--border))]">
                {items.map((n) => {
                  const icon = (n.data as NotificationData)?.icon as string | undefined;
                  const type = (n.data as NotificationData)?.type as string | undefined;
                  const bg = type ? (TYPE_BG[type] ?? TYPE_BG.system) : TYPE_BG.system;
                  const isUnread = n.status === "UNREAD";

                  return (
                    <div
                      key={n.id}
                      className={`group flex gap-3 px-4 py-3 transition hover:bg-[hsl(var(--accent)/0.5)] ${isUnread ? "bg-[hsl(var(--primary)/0.02)]" : ""}`}
                    >
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base ${bg}`}>
                        {icon ?? "🔔"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-xs leading-snug ${isUnread ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                          {isUnread && (
                            <button
                              onClick={() => markRead(n.id)}
                              title="Okundu yap"
                              className="shrink-0 opacity-0 group-hover:opacity-100 transition"
                            >
                              <Check className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]" />
                            </button>
                          )}
                        </div>
                        {n.body && <p className="mt-0.5 text-[11px] leading-snug text-[hsl(var(--muted-foreground))] line-clamp-2">{n.body}</p>}
                        <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground)/0.6)]">{timeAgo(n.createdAt)}</p>
                      </div>
                      {isUnread && <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--primary))]" />}
                    </div>
                  );
                })}

                {nextCursor && (
                  <div className="px-4 py-2 text-center">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 mx-auto text-xs text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))]"
                    >
                      {loadingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                      Daha fazla yükle
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
