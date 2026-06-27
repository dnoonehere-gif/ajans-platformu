"use client";
import { useState, use } from "react";
import { Star, Send, CheckCircle } from "lucide-react";

export default function QrFeedbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Lütfen bir puan verin."); return; }
    setLoading(true);
    setError("");

    const res = await fetch(`/api/qr/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, text, authorName: authorName || undefined }),
    });

    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Bir hata oluştu.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
        <h1 className="mb-2 text-2xl font-bold">Teşekkürler!</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Geri bildiriminiz başarıyla iletildi.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Deneyiminizi Paylaşın</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Görüşleriniz bize gelişmemiz için yol gösteriyor.
          </p>
        </div>

        <form onSubmit={submit} className="glass rounded-3xl p-8 space-y-5">
          {/* Yıldız puanı */}
          <div className="text-center">
            <p className="mb-3 text-sm font-medium">Puanınız</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className="h-9 w-9 transition-colors"
                    fill={(hover || rating) >= star ? "#f59e0b" : "none"}
                    stroke={(hover || rating) >= star ? "#f59e0b" : "currentColor"}
                  />
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              {rating === 1 ? "Çok kötü" : rating === 2 ? "Kötü" : rating === 3 ? "Orta" : rating === 4 ? "İyi" : rating === 5 ? "Mükemmel" : ""}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Adınız (opsiyonel)</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Adınız Soyadınız"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Görüşünüz</label>
            <textarea
              required
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Deneyiminizi paylaşın..."
              className="w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Gönderiliyor..." : "Gönder"}
          </button>
        </form>
      </div>
    </div>
  );
}
