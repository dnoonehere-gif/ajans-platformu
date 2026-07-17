"use client";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Star, RefreshCw, Loader2, Unlink, CheckCircle2,
  AlertCircle, MapPin, BarChart3, MessageSquare, Search, X,
  Sparkles, Copy, Check,
} from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    selectBrand: "Önce bir marka seçin",
    subtitle: "Maps & Business entegrasyonu",
    tabMaps: "Google Maps", tabOauth: "Business Account",
    connectedMsg: "Google Business başarıyla bağlandı!",
    cancelled: "Bağlantı iptal edildi.", connectError: "Bağlantı sırasında hata oluştu.",
    synced: "yorum senkronize edildi.",
    syncFail: "Senkronizasyon başarısız",
    searchTitle: "Google Maps'te İşletmeyi Bul",
    searchDesc: "İşletme adı ve şehri yazın, Google Maps'teki listenizi bulun ve yorumları çekin.",
    searchPh: "örn: ABC Cafe Kadıköy Istanbul",
    searchBtn: "Ara", searchFail: "Arama başarısız",
    fetchFail: "Yorumlar çekilemedi",
    added: "Eklendi", fetchReviews: "Yorumları Çek",
    reviewsWord: "yorum",
    mapsListing: "Google Maps Listesi",
    lastSync: "Son çekim:", connected: "Bağlı", disconnect: "Bağlantıyı Kes",
    disconnectConfirm: "Google bağlantısını kesmek istediğinizden emin misiniz?",
    avgRating: "Ortalama Puan", totalReviews: "Toplam Yorum", fetchedReviews: "Çekilen Yorum",
    ratingDist: "Puan Dağılımı", reviewsTitle: "Yorumlar",
    anonymous: "Anonim",
    today: "Bugün", yesterday: "Dün", daysAgo: "gün önce", monthsAgo: "ay önce", yearsAgo: "yıl önce",
    aiReply: "AI Yanıt Önerisi", writing: "Yazılıyor...", replySuggestion: "Yanıt Önerisi",
    regenerate: "Yeniden oluştur", copy: "Kopyala",
    replyHint: "Kopyalayıp Google Business profilinizden yanıt olarak yapıştırabilirsiniz.",
    replyFail: "Öneri oluşturulamadı", connFail: "Bağlantı hatası",
    oauthTitle: "Business Account Bağla",
    oauthDesc: "Google hesabınızla giriş yapın, tüm yorumlarınızı yönetin ve yanıtlayın.",
    oauthFeatures: ["Tüm yorumlara erişim (sadece 5 değil)", "Yorumlara yanıt verme", "İşletme bilgilerini yönetme"],
    connectGoogle: "Google ile Bağlan",
    syncBtn: "Senkronize Et", disconnectShort: "Kes",
  },
  en: {
    selectBrand: "Select a brand first",
    subtitle: "Maps & Business integration",
    tabMaps: "Google Maps", tabOauth: "Business Account",
    connectedMsg: "Google Business connected successfully!",
    cancelled: "Connection cancelled.", connectError: "An error occurred while connecting.",
    synced: "reviews synced.",
    syncFail: "Sync failed",
    searchTitle: "Find Your Business on Google Maps",
    searchDesc: "Type the business name and city, find your Maps listing and pull the reviews.",
    searchPh: "e.g. ABC Cafe Brooklyn NYC",
    searchBtn: "Search", searchFail: "Search failed",
    fetchFail: "Could not fetch reviews",
    added: "Added", fetchReviews: "Fetch Reviews",
    reviewsWord: "reviews",
    mapsListing: "Google Maps Listing",
    lastSync: "Last sync:", connected: "Connected", disconnect: "Disconnect",
    disconnectConfirm: "Are you sure you want to disconnect Google?",
    avgRating: "Average Rating", totalReviews: "Total Reviews", fetchedReviews: "Fetched Reviews",
    ratingDist: "Rating Distribution", reviewsTitle: "Reviews",
    anonymous: "Anonymous",
    today: "Today", yesterday: "Yesterday", daysAgo: "days ago", monthsAgo: "months ago", yearsAgo: "years ago",
    aiReply: "AI Reply Suggestion", writing: "Writing...", replySuggestion: "Reply Suggestion",
    regenerate: "Regenerate", copy: "Copy",
    replyHint: "Copy it and paste as a reply from your Google Business profile.",
    replyFail: "Could not generate a suggestion", connFail: "Connection error",
    oauthTitle: "Connect Business Account",
    oauthDesc: "Sign in with your Google account to manage and reply to all your reviews.",
    oauthFeatures: ["Access all reviews (not just 5)", "Reply to reviews", "Manage business details"],
    connectGoogle: "Connect with Google",
    syncBtn: "Sync Now", disconnectShort: "Disconnect",
  },
};

interface GoogleProfile {
  id: string;
  locationName: string | null;
  accountEmail: string | null;
  averageRating: number | null;
  totalReviews: number;
  lastSyncedAt: string | null;
  googlePlaceId: string | null;
}

interface Review {
  id: string;
  authorName: string | null;
  rating: number;
  text: string | null;
  createdAt: string;
}

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  totalRatings: number;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`h-4 w-4 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-[hsl(var(--muted-foreground)/0.3)]"}`} />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string, tL: typeof L.tr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return tL.today;
  if (days === 1) return tL.yesterday;
  if (days < 30) return `${days} ${tL.daysAgo}`;
  if (days < 365) return `${Math.floor(days / 30)} ${tL.monthsAgo}`;
  return `${Math.floor(days / 365)} ${tL.yearsAgo}`;
}

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

// ── Places Arama Bileşeni ──
function PlacesSearch({ brandId, onSynced }: { brandId: string; onSynced: () => void }) {
  const { lang } = useLang();
  const sL = L[lang];
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setError("");
    const res = await fetch(`/api/google/places/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!res.ok) setError(data.error ?? sL.searchFail);
    else setResults(data.places ?? []);
    setSearching(false);
  }

  async function fetchReviews(place: PlaceResult) {
    setSyncing(place.placeId);
    setError("");
    const res = await fetch("/api/google/places/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, placeId: place.placeId, placeName: place.name }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error ?? sL.fetchFail);
    else { setDone(place.placeId); onSynced(); }
    setSyncing(null);
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-[hsl(var(--primary))]" />
        <p className="font-semibold">{sL.searchTitle}</p>
      </div>
      <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
        {sL.searchDesc}
      </p>

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder={sL.searchPh}
          className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] placeholder:text-[hsl(var(--muted-foreground))]"
        />
        <button
          onClick={search}
          disabled={searching || !query.trim()}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {sL.searchBtn}
        </button>
      </div>

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((place) => (
            <div key={place.placeId} className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{place.name}</p>
                <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{place.address}</p>
                {place.rating && (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{place.rating}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">({place.totalRatings} {sL.reviewsWord})</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => fetchReviews(place)}
                disabled={syncing === place.placeId}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  done === place.placeId
                    ? "bg-green-500/15 text-green-400"
                    : "bg-[hsl(var(--primary))] text-white hover:opacity-90 disabled:opacity-50"
                }`}
              >
                {syncing === place.placeId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : done === place.placeId ? (
                  <><CheckCircle2 className="h-3.5 w-3.5" /> {sL.added}</>
                ) : (
                  <><RefreshCw className="h-3.5 w-3.5" /> {sL.fetchReviews}</>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Yorum Kartı (AI yanıt önerili) ──
function ReviewCard({ review, brandId }: { review: Review; brandId: string }) {
  const { lang } = useLang();
  const sL = L[lang];
  const [reply, setReply] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function generateReply() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/google/reply-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, reviewId: review.id }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? sL.replyFail);
      else setReply(data.reply);
    } catch {
      setError(sL.connFail);
    }
    setGenerating(false);
  }

  function copyReply() {
    if (!reply) return;
    navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.12)] text-sm font-bold text-[hsl(var(--primary))]">
            {(review.authorName ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{review.authorName ?? sL.anonymous}</p>
            <StarRow rating={review.rating} />
          </div>
        </div>
        <span className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
          {timeAgo(review.createdAt, sL)}
        </span>
      </div>
      {review.text && (
        <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
          {review.text}
        </p>
      )}

      {/* AI Yanıt Önerisi */}
      <div className="mt-3 border-t border-[hsl(var(--border))] pt-3">
        {!reply ? (
          <button
            onClick={generateReply}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary)/0.1)] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary))] transition hover:bg-[hsl(var(--primary)/0.2)] disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {generating ? sL.writing : sL.aiReply}
          </button>
        ) : (
          <div className="rounded-xl bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.15)] p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--primary))]">
                <Sparkles className="h-3.5 w-3.5" /> {sL.replySuggestion}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={generateReply}
                  disabled={generating}
                  title={sL.regenerate}
                  className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]"
                >
                  {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={copyReply}
                  title={sL.copy}
                  className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{reply}</p>
            <p className="mt-2 text-[10px] text-[hsl(var(--muted-foreground))]">
              {sL.replyHint}
            </p>
          </div>
        )}
        {error && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
      </div>
    </div>
  );
}

function GoogleContent() {
  const { activeBrand } = useBrand();
  const { lang } = useLang();
  const sL = L[lang];
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<GoogleProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncResult, setSyncResult] = useState<{ synced: number } | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"maps" | "oauth">("maps");

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

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

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
    if (!res.ok) setError(data.error ?? sL.syncFail);
    else { setSyncResult({ synced: data.synced }); await fetchStatus(); }
    setSyncing(false);
  }

  async function disconnect() {
    if (!activeBrand || !confirm(sL.disconnectConfirm)) return;
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

  if (!activeBrand) return (
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
      {sL.selectBrand}
    </div>
  );

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[hsl(var(--border))]">
          <GoogleLogo className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Google</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{activeBrand.name} · {sL.subtitle}</p>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="mb-6 flex gap-1 rounded-xl bg-[hsl(var(--muted)/0.5)] p-1 w-fit">
        {[
          { key: "maps", label: sL.tabMaps, icon: MapPin },
          { key: "oauth", label: sL.tabOauth, icon: GoogleLogo },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as "maps" | "oauth")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === key
                ? "bg-[hsl(var(--background))] shadow-sm text-[hsl(var(--foreground))]"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Bildirimler */}
      {connectedParam === "1" && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-green-500/10 px-5 py-3.5 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {sL.connectedMsg}
        </div>
      )}
      {errorParam && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-red-500/10 px-5 py-3.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorParam === "cancelled" ? sL.cancelled : sL.connectError}
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-red-500/10 px-5 py-3.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {syncResult && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-green-500/10 px-5 py-3.5 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {syncResult.synced} {sL.synced}
        </div>
      )}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── MAPS SEKMESİ ── */}
          {tab === "maps" && (
            <>
              <PlacesSearch brandId={activeBrand.id} onSynced={fetchStatus} />

              {/* Bağlı profil (Maps üzerinden) */}
              {profile?.googlePlaceId && (
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
                      <div>
                        <p className="font-semibold">{profile.locationName ?? sL.mapsListing}</p>
                        {profile.lastSyncedAt && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {sL.lastSync} {timeAgo(profile.lastSyncedAt, sL)}
                          </p>
                        )}
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> {sL.connected}
                      </span>
                    </div>
                    <button
                      onClick={disconnect}
                      disabled={disconnecting}
                      className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))] transition hover:border-red-400 hover:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" /> {sL.disconnect}
                    </button>
                  </div>
                </div>
              )}

              {/* İstatistikler + Yorumlar */}
              {profile && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass rounded-2xl p-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-3xl font-bold text-amber-400">
                        {profile.averageRating?.toFixed(1) ?? "—"}
                        <Star className="h-6 w-6 fill-amber-400" />
                      </div>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.avgRating}</p>
                    </div>
                    <div className="glass rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold">{profile.totalReviews}</div>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.totalReviews}</p>
                    </div>
                    <div className="glass rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold">{reviews.length}</div>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{sL.fetchedReviews}</p>
                    </div>
                  </div>

                  {/* Puan dağılımı */}
                  {reviews.length > 0 && (
                    <div className="glass rounded-2xl p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <p className="text-sm font-semibold">{sL.ratingDist}</p>
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
                                <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-8 shrink-0 text-right text-xs text-[hsl(var(--muted-foreground))]">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Yorumlar */}
                  {reviews.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <p className="text-sm font-semibold">{sL.reviewsTitle}</p>
                      </div>
                      {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} brandId={activeBrand.id} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── OAUTH SEKMESİ ── */}
          {tab === "oauth" && (
            !profile?.accountEmail ? (
              <div className="glass mx-auto max-w-md rounded-3xl p-10 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[hsl(var(--border))]">
                  <GoogleLogo className="h-10 w-10" />
                </div>
                <h2 className="mb-2 text-xl font-bold">{sL.oauthTitle}</h2>
                <p className="mb-8 text-sm text-[hsl(var(--muted-foreground))]">
                  {sL.oauthDesc}
                </p>
                <div className="mb-6 space-y-3 text-left">
                  {sL.oauthFeatures.map((f) => (
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
                  {sL.connectGoogle}
                </a>
              </div>
            ) : (
              <div className="space-y-4">
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
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> {sL.connected}
                          </span>
                        </div>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">{profile.accountEmail}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={syncReviews}
                        disabled={syncing}
                        className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        {sL.syncBtn}
                      </button>
                      <button
                        onClick={disconnect}
                        disabled={disconnecting}
                        className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] transition hover:border-red-400 hover:text-red-400"
                      >
                        <Unlink className="h-4 w-4" /> {sL.disconnectShort}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}


export default function GooglePage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="h-64 animate-pulse rounded-2xl bg-[hsl(var(--muted)/0.3)]" /></div>}>
      <GoogleContent />
    </Suspense>
  );
}
