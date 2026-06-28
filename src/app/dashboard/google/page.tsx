"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Star, RefreshCw, Loader2, Unlink, CheckCircle2,
  AlertCircle, MapPin, BarChart3, MessageSquare,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";

interface GoogleProfile {
  id: string;
  locationName: string | null;
  accountEmail: string | null;
  averageRating: number | null;
  totalReviews: number;
  lastSyncedAt: string | null;
}

interface Review {
  id: string;
  authorName: string | null;
  rating: number;
  text: string | null;
  createdAt: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-[hsl(var(--muted-foreground)/0.3)]"}`}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Bugün";
  if (days === 1) return "Dün";
  if (days < 30) return `${days} gün önce`;
  if (days < 365) return `${Math.floor(days / 30)} ay önce`;
  return `${Math.floor(days / 365)} yıl önce`;
}

// SVG Google Logo
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function GooglePage() {
  const { activeBrand } = useBrand();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number } | null>(null);
  const [error, setError] = useState("");

  const connectedParam = searchParams.get("connected");
  const errorParam = searchParams.get("error");

  const fetchStatus = useCallback(async () => {
    if (!activeBrand) return;
    setLoading(true);
    const res = await fetch(`/api/google/status?brandId=${activeBrand.id}`);
    const data = await res.json();
    setProfile(data.profile ?? null);
    setReviews(data.reviews ?? []);
    setLoading(false);
  }, [activeBrand?.id]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function syncReviews() {
    if (!activeBrand) return;
    setSyncing(true);
    setSyncResult(null);
    setError("");
    const res = await fetch("/api/google/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: activeBrand.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Senkronizasyon başarısız");
    } else {
      setSyncResult({ synced: data.synced });
      await fetchStatus();
    }
    setSyncing(false);
  }

  async function disconnect() {
    if (!activeBrand || !confirm("Google Business bağlantısını kesmek istediğinizden emin misiniz?")) return;
    setDisconnecting(true);
    await fetch("/api/google/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: activeBrand.id }),
    });
    setProfile(null);
    setReviews([]);
    setDisconnecting(false);
  }

  if (!activeBrand) {
    return (
      <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
        Önce bir marka seçin
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[hsl(var(--border))]">
          <GoogleLogo className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Google Business</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {activeBrand.name} · Google yorumlarını senkronize et
          </p>
        </div>
      </div>

      {/* Bildirimler */}
      {connectedParam === "1" && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-green-500/10 px-5 py-3.5 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Google Business başarıyla bağlandı!
        </div>
      )}
      {errorParam && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-500/10 px-5 py-3.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorParam === "cancelled" ? "Bağlantı iptal edildi." : "Bağlantı sırasında hata oluştu."}
        </div>
      )}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-500/10 px-5 py-3.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {syncResult && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-green-500/10 px-5 py-3.5 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {syncResult.synced} yorum senkronize edildi.
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : !profile ? (
        /* ── Bağlı değil ── */
        <div className="glass mx-auto max-w-md rounded-3xl p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[hsl(var(--border))]">
            <GoogleLogo className="h-10 w-10" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Google Business'ı Bağla</h2>
          <p className="mb-8 text-sm text-[hsl(var(--muted-foreground))]">
            Google hesabınızı bağlayarak işletme yorumlarınızı otomatik çekin, analiz edin.
          </p>
          <div className="mb-6 space-y-3 text-left">
            {[
              "Google yorumlarını otomatik senkronize et",
              "Yıldız ortalaması ve yorum sayısını takip et",
              "AI ile yorum analizini etkinleştir",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" />
                {f}
              </div>
            ))}
          </div>
          <a
            href={`/api/google/connect?brandId=${activeBrand.id}`}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-gray-700 shadow-md ring-1 ring-[hsl(var(--border))] transition hover:shadow-lg"
          >
            <GoogleLogo className="h-5 w-5" />
            Google ile Bağlan
          </a>
          <p className="mt-4 text-xs text-[hsl(var(--muted-foreground))]">
            Google hesabınıza güvenli OAuth2 ile bağlanır. Şifrenizi görmeyiz.
          </p>
        </div>
      ) : (
        /* ── Bağlı ── */
        <div className="space-y-6">
          {/* Bağlantı kartı */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[hsl(var(--border))]">
                  <GoogleLogo className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{profile.locationName ?? "Google Business"}</p>
                    <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Bağlı
                    </span>
                  </div>
                  {profile.accountEmail && (
                    <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">
                      {profile.accountEmail}
                    </p>
                  )}
                  {profile.lastSyncedAt && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                      <RefreshCw className="h-3 w-3" />
                      Son senkronizasyon: {timeAgo(profile.lastSyncedAt)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={syncReviews}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {syncing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Yorumları Senkronize Et
                </button>
                <button
                  onClick={disconnect}
                  disabled={disconnecting}
                  className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:border-red-400 hover:text-red-400"
                >
                  <Unlink className="h-4 w-4" />
                  Bağlantıyı Kes
                </button>
              </div>
            </div>
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-3xl font-bold text-amber-400">
                {profile.averageRating?.toFixed(1) ?? "—"}
                <Star className="h-6 w-6 fill-amber-400" />
              </div>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Ortalama Puan</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <div className="text-3xl font-bold">{profile.totalReviews}</div>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Toplam Yorum</p>
            </div>
            <div className="glass rounded-2xl p-5 text-center">
              <div className="text-3xl font-bold">{reviews.length}</div>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Senkronize Yorum</p>
            </div>
          </div>

          {/* Puan dağılımı */}
          {reviews.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[hsl(var(--primary))]" />
                <p className="text-sm font-semibold">Puan Dağılımı</p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex w-16 shrink-0 items-center gap-1 text-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{star}</span>
                      </div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-xs text-[hsl(var(--muted-foreground))]">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Yorum listesi */}
          {reviews.length === 0 ? (
            <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl py-16 text-center">
              <MessageSquare className="h-10 w-10 text-[hsl(var(--muted-foreground)/0.3)]" />
              <p className="font-semibold">Henüz yorum yok</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                "Yorumları Senkronize Et" butonuna tıklayarak Google yorumlarınızı çekin
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[hsl(var(--primary))]" />
                <p className="text-sm font-semibold">Yorumlar</p>
              </div>
              {reviews.map((review) => (
                <div key={review.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-bold text-[hsl(var(--primary))]">
                        {(review.authorName ?? "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{review.authorName ?? "Anonim"}</p>
                        <StarRow rating={review.rating} />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
                      {timeAgo(review.createdAt)}
                    </span>
                  </div>
                  {review.text && (
                    <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {review.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
