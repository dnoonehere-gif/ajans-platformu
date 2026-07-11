"use client";
import { useState, useEffect } from "react";
import { Plus, Loader2, Pencil, Trash2, Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  interval: string;
  trialDays: number;
  isActive: boolean;
  _count: { subscriptions: number };
}

export default function PaketlerPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", priceCents: "", trialDays: "0", interval: "month" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/plans").then((r) => r.json()).then((d) => { setPlans(d.plans ?? []); setLoading(false); });
  }, []);

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    const res = await fetch("/api/admin/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, priceCents: Number(form.priceCents) * 100, trialDays: Number(form.trialDays) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Hata"); setCreating(false); return; }
    setPlans((p) => [data.plan, ...p]);
    setShowForm(false);
    setForm({ name: "", slug: "", priceCents: "", trialDays: "0", interval: "month" });
    setCreating(false);
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/plans/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) });
    const data = await res.json();
    if (data.plan) setPlans((p) => p.map((pl) => pl.id === id ? data.plan : pl));
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paketler</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Abonelik planları</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Yeni Paket
        </button>
      </div>

      {showForm && (
        <form onSubmit={createPlan} className="glass mb-6 rounded-2xl p-5 space-y-4">
          <p className="font-semibold">Yeni Paket Oluştur</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Paket Adı", key: "name", placeholder: "Başlangıç" },
              { label: "Slug", key: "slug", placeholder: "baslangic" },
              { label: "Fiyat (₺)", key: "priceCents", placeholder: "299", type: "number" },
              { label: "Deneme Süresi (gün)", key: "trialDays", placeholder: "14", type: "number" },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-sm font-medium">{f.label}</label>
                <input
                  type={f.type ?? "text"} required placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 text-sm outline-none focus:border-[hsl(var(--primary))] transition"
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Dönem</label>
              <select value={form.interval} onChange={(e) => setForm((f) => ({ ...f, interval: e.target.value }))}
                className="flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 text-sm outline-none focus:border-[hsl(var(--primary))] transition">
                <option value="month">Aylık</option>
                <option value="year">Yıllık</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Oluştur
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
              İptal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`glass rounded-2xl p-5 ${!plan.isActive ? "opacity-60" : ""}`}>
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="font-bold">{plan.name}</p>
                  <p className="text-xs font-mono text-[hsl(var(--muted-foreground))]">{plan.slug}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActive(plan.id, plan.isActive)}
                    className={`rounded-lg px-2 py-1 text-xs font-medium transition ${plan.isActive ? "bg-green-500/10 text-green-400 hover:bg-red-500/10 hover:text-red-400" : "bg-red-500/10 text-red-400 hover:bg-green-500/10 hover:text-green-400"}`}>
                    {plan.isActive ? "Aktif" : "Pasif"}
                  </button>
                </div>
              </div>
              <p className="text-3xl font-black">
                ₺{(plan.priceCents / 100).toLocaleString("tr-TR")}
                <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">/{plan.interval === "month" ? "ay" : "yıl"}</span>
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>{plan.trialDays} gün deneme</span>
                <span>{plan._count.subscriptions} abonelik</span>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-3 py-16 text-center text-[hsl(var(--muted-foreground))]">
              Henüz paket yok. Yeni paket oluşturun.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
