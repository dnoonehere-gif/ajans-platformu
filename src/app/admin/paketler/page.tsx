"use client";
import { useState, useEffect } from "react";
import { Plus, Loader2, Pencil, Trash2, Check } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    plans: "Paketler", plansSub: "Abonelik planları", newPlan: "Yeni Paket Oluştur",
    planName: "Paket Adı", planNamePh: "Başlangıç", trialDays: "Deneme Süresi (gün)",
    period: "Dönem", monthly: "Aylık", yearly: "Yıllık",
    create: "Oluştur", cancel: "İptal", month: "ay", year: "yıl",
    daysTrial: (n: number) => `${n} gün deneme`,
    empty: "{sL.empty}",
  },
  en: {
    plans: "Plans", plansSub: "Subscription plans", newPlan: "Create New Plan",
    planName: "Plan Name", planNamePh: "Starter", trialDays: "Trial Period (days)",
    period: "Period", monthly: "Monthly", yearly: "Yearly",
    create: "Create", cancel: "Cancel", month: "mo", year: "yr",
    daysTrial: (n: number) => `${n} days trial`,
    empty: "No plans yet. Create a new one.",
  },
};


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
  const { lang } = useLang();
  const sL = L[lang];
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
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{sL.plansSub}</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Yeni Paket
        </button>
      </div>

      {showForm && (
        <form onSubmit={createPlan} className="glass mb-6 rounded-2xl p-5 space-y-4">
          <p className="font-semibold">{sL.newPlan}</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: sL.planName, key: "name", placeholder: sL.planNamePh },
              { label: "Slug", key: "slug", placeholder: "baslangic" },
              { label: "Fiyat (₺)", key: "priceCents", placeholder: "299", type: "number" },
              { label: sL.trialDays, key: "trialDays", placeholder: "14", type: "number" },
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
              <label className="text-sm font-medium">{sL.period}</label>
              <select value={form.interval} onChange={(e) => setForm((f) => ({ ...f, interval: e.target.value }))}
                className="flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 text-sm outline-none focus:border-[hsl(var(--primary))] transition">
                <option value="month">{sL.monthly}</option>
                <option value="year">{sL.yearly}</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {sL.create}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
              {sL.cancel}
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
                <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">/{plan.interval === "month" ? sL.month : sL.year}</span>
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span>{sL.daysTrial(plan.trialDays)}</span>
                <span>{plan._count.subscriptions} abonelik</span>
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-3 py-16 text-center text-[hsl(var(--muted-foreground))]">
              {sL.empty}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
