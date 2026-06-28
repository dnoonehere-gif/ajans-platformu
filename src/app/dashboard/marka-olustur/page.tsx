"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Building2 } from "lucide-react";

export default function MarkaOlusturPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", slug: "", description: "", email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputCls = "flex h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/brand", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Hata oluştu"); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.15)]">
          <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Yeni Marka Oluştur</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">İşletmenizi platforma ekleyin</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Marka Adı *</label>
            <input required className={inputCls} placeholder="Örn: Lezzet Durağı" value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                setForm((f) => ({ ...f, name, slug }));
              }} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Slug (URL)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[hsl(var(--muted-foreground))]">/</span>
              <input className={inputCls} placeholder="lezzet-duragi" value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">E-posta</label>
            <input type="email" className={inputCls} placeholder="info@marka.com" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Telefon</label>
            <input className={inputCls} placeholder="0532 xxx xx xx" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium">Açıklama</label>
            <textarea className={`${inputCls} h-24 resize-none py-3`} placeholder="İşletmenizi kısaca tanıtın..."
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
        </div>

        {error && <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Marka Oluştur
        </button>
      </form>
    </div>
  );
}
