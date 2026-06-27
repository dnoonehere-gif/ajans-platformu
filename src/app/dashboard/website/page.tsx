"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Sparkles, Loader2 } from "lucide-react";

export default function WebsitePage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "loading">("form");
  const [form, setForm] = useState({
    brandId: "",
    sector: "",
    description: "",
  });
  const [error, setError] = useState("");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/website/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Bir hata oluştu");
        setStep("form");
        return;
      }

      router.push(`/dashboard/website/editor/${data.website.id}`);
    } catch {
      setError("Bağlantı hatası");
      setStep("form");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-10 flex items-center gap-3">
        <Globe className="h-8 w-8 text-[hsl(var(--primary))]" />
        <div>
          <h1 className="text-2xl font-bold">AI Web Sitesi Kurucu</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Marka bilgilerini gir, yapay zekâ saniyeler içinde kurumsal siten hazır.
          </p>
        </div>
      </div>

      {step === "loading" ? (
        <div className="glass flex flex-col items-center gap-4 rounded-3xl p-16 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--primary))]" />
          <p className="font-medium">Yapay zekâ sitenizi oluşturuyor...</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Bu işlem 10-20 saniye sürebilir
          </p>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="glass rounded-3xl p-8 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Marka ID</label>
            <input
              type="text"
              required
              placeholder="brand_xxxxx"
              value={form.brandId}
              onChange={(e) => setForm({ ...form, brandId: e.target.value })}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Sektör</label>
            <input
              type="text"
              required
              placeholder="Restoran, Hukuk Bürosu, Güzellik Merkezi..."
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Marka Hakkında</label>
            <textarea
              required
              rows={4}
              placeholder="İşletmenizi, sunduğunuz hizmetleri ve hedef kitlenizi kısaca anlatın..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition resize-none"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-3 font-semibold text-white transition hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            Siteyi Oluştur
          </button>
        </form>
      )}
    </div>
  );
}
