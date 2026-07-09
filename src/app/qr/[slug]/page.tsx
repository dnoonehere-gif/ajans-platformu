"use client";
import { useState, useEffect, use } from "react";
import { Star, Send, CheckCircle2, Loader2 } from "lucide-react";
import Image from "next/image";

interface Brand {
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  sector: string | null;
}

const STAR_LABELS = ["", "Çok Kötü", "Kötü", "Orta", "İyi", "Mükemmel"];
const STAR_EMOJIS = ["", "😞", "😕", "😐", "😊", "🤩"];

export default function QrFeedbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const color = brand?.primaryColor ?? "#6366f1";
  const active = hover || rating;

  useEffect(() => {
    fetch(`/api/qr/public/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setNotFound(true);
        else { setBrand(d.brand); setLabel(d.label ?? null); }
      });
  }, [slug]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Lütfen bir puan verin."); return; }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/qr/public/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, text: text || "—", authorName: authorName || undefined }),
    });
    if (res.ok) setDone(true);
    else { const d = await res.json(); setError(d.error ?? "Bir hata oluştu."); }
    setLoading(false);
  }

  // ── Bulunamadı ──
  if (notFound) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-5xl">😕</div>
      <h1 className="text-xl font-bold">QR kodu bulunamadı</h1>
      <p className="text-sm text-[hsl(var(--muted-foreground))]">Bu QR kodu geçersiz veya devre dışı.</p>
    </div>
  );

  // ── Yükleniyor ──
  if (!brand) return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
    </div>
  );

  // ── Teşekkür ──
  if (done) return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: `linear-gradient(135deg, ${color}18 0%, transparent 60%)` }}
    >
      <div className="animate-bounce text-7xl">🎉</div>
      <CheckCircle2 className="h-16 w-16" style={{ color }} />
      <div>
        <h1 className="text-2xl font-bold">Teşekkürler!</h1>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Geri bildiriminiz <span className="font-semibold" style={{ color }}>{brand.name}</span>'e iletildi.
        </p>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Değerli yorumunuz için teşekkür ederiz. 🙏
        </p>
      </div>
      <div className="flex text-4xl">
        {[...Array(rating)].map((_, i) => (
          <span key={i} style={{ color: "#f59e0b" }}>★</span>
        ))}
      </div>
    </div>
  );

  // ── Form ──
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{ background: `linear-gradient(135deg, ${color}15 0%, transparent 50%)` }}
    >
      <div className="w-full max-w-sm">

        {/* Marka başlığı */}
        <div className="mb-8 text-center">
          {brand.logoUrl ? (
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              width={72}
              height={72}
              className="mx-auto mb-4 h-18 w-18 rounded-2xl object-contain shadow-md"
              unoptimized
            />
          ) : (
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-md"
              style={{ backgroundColor: color }}
            >
              {brand.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <h1 className="text-xl font-bold">{brand.name}</h1>
          {label && <p className="mt-0.5 text-sm text-[hsl(var(--muted-foreground))]">{label}</p>}
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Deneyiminizi paylaşın, bizi geliştirin.
          </p>
        </div>

        <form onSubmit={submit} className="glass space-y-6 rounded-3xl p-7 shadow-xl">

          {/* Yıldız seçimi */}
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold">Puanınız nedir?</p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-all duration-150 hover:scale-125 active:scale-95"
                >
                  <Star
                    className="h-10 w-10 transition-colors duration-150"
                    fill={active >= star ? "#f59e0b" : "none"}
                    stroke={active >= star ? "#f59e0b" : "hsl(var(--muted-foreground))"}
                    strokeWidth={active >= star ? 1.5 : 1.5}
                  />
                </button>
              ))}
            </div>
            {active > 0 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-2xl">{STAR_EMOJIS[active]}</span>
                <span className="text-sm font-semibold" style={{ color }}>{STAR_LABELS[active]}</span>
              </div>
            )}
          </div>

          {/* İsim */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Adınız <span className="text-[hsl(var(--muted-foreground))]">(opsiyonel)</span>
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Adınız Soyadınız"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-3 text-sm outline-none transition focus:ring-2 placeholder:text-[hsl(var(--muted-foreground))]"
              style={{ "--tw-ring-color": color } as React.CSSProperties}
            />
          </div>

          {/* Yorum */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Görüşünüz <span className="text-[hsl(var(--muted-foreground))]">(opsiyonel)</span>
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Deneyiminizi anlatın..."
              className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-3 text-sm outline-none transition placeholder:text-[hsl(var(--muted-foreground))]"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || rating === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white shadow-lg transition hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
          Novelya ile güçlendirilmiştir
        </p>
      </div>
    </div>
  );
}
