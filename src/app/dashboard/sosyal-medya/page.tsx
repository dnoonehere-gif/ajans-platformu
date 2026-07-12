"use client";
import { useEffect, useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, Plus, Trash2, Calendar, Instagram, Facebook, Linkedin, Twitter, Send } from "lucide-react";

const PLATFORMS = [
  { value: "INSTAGRAM", label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { value: "FACEBOOK", label: "Facebook", icon: Facebook, color: "text-blue-500" },
  { value: "LINKEDIN", label: "LinkedIn", icon: Linkedin, color: "text-sky-600" },
  { value: "TWITTER", label: "X (Twitter)", icon: Twitter, color: "text-slate-400" },
] as const;

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  mediaUrl: string | null;
  scheduledAt: string;
  publishedAt: string | null;
  status: string;
}

export default function SosyalMedyaPage() {
  const { activeBrand } = useBrand();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [platform, setPlatform] = useState("INSTAGRAM");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!activeBrand) return;
    setLoading(true);
    fetch(`/api/social?brandId=${activeBrand.id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setError(d.error ?? "Veriler yüklenemedi"); return; }
        setPosts(d.posts ?? []);
        setError("");
      })
      .catch(() => setError("Sunucuya bağlanılamadı"))
      .finally(() => setLoading(false));
  }, [activeBrand?.id]);

  async function handleCreate() {
    if (!activeBrand || !content || !scheduledAt) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: activeBrand.id,
          platform,
          content,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Oluşturulamadı");
      else {
        setPosts([...posts, data.post].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
        setContent("");
        setScheduledAt("");
        setShowForm(false);
      }
    } catch {
      setError("Sunucuya bağlanılamadı, lütfen tekrar deneyin");
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/social?id=${id}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p.id !== id));
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  const inp = "w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
            <Send className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Sosyal Medya Yönetimi</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">İçerik takvimi ve planlanmış paylaşımlar</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Yeni Paylaşım
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

      {/* Yeni paylaşım formu */}
      {showForm && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="mb-4 font-semibold">Yeni Paylaşım Planla</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Platform</label>
              <select className={inp} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Tarih & Saat</label>
              <input type="datetime-local" className={inp} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">İçerik</label>
            <textarea className={inp + " h-24 resize-none"} placeholder="Paylaşım metni..." value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <button onClick={handleCreate} disabled={creating || !content || !scheduledAt}
            className="mt-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
            {creating ? "Planlanıyor..." : "Planla"}
          </button>
        </section>
      )}

      {/* Takvim listesi */}
      <section className="space-y-3">
        <h2 className="font-semibold">Planlanmış Paylaşımlar ({posts.length})</h2>
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Henüz planlanmış paylaşım yok</p>
          </div>
        ) : (
          posts.map((post) => {
            const plat = PLATFORMS.find((p) => p.value === post.platform);
            const Icon = plat?.icon ?? Instagram;
            return (
              <div key={post.id} className="flex items-start gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                <div className={`mt-0.5 ${plat?.color ?? ""}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{plat?.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      post.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500" :
                      post.status === "FAILED" ? "bg-red-500/10 text-red-500" :
                      post.status === "DRAFT" ? "bg-slate-500/10 text-slate-500" :
                      "bg-violet-500/10 text-violet-500"
                    }`}>
                      {post.status === "PUBLISHED" ? "Yayında" : post.status === "FAILED" ? "Başarısız" : post.status === "DRAFT" ? "Taslak" : "Planlandı"}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{formatDate(post.scheduledAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-[hsl(var(--foreground))] line-clamp-2">{post.content}</p>
                </div>
                {post.status !== "PUBLISHED" && (
                  <button onClick={() => handleDelete(post.id)} className="shrink-0 text-red-400 transition hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
