"use client";
import { useEffect, useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, Plus, Trash2, UserPlus, Phone, Mail, Building, DollarSign } from "lucide-react";

const STAGES = [
  { value: "NEW", label: "Yeni", color: "border-blue-500/30 bg-blue-500/5", dot: "bg-blue-500" },
  { value: "CONTACTED", label: "İletişime Geçildi", color: "border-violet-500/30 bg-violet-500/5", dot: "bg-violet-500" },
  { value: "QUALIFIED", label: "Nitelikli", color: "border-amber-500/30 bg-amber-500/5", dot: "bg-amber-500" },
  { value: "PROPOSAL", label: "Teklif", color: "border-orange-500/30 bg-orange-500/5", dot: "bg-orange-500" },
  { value: "WON", label: "Kazanıldı", color: "border-emerald-500/30 bg-emerald-500/5", dot: "bg-emerald-500" },
  { value: "LOST", label: "Kaybedildi", color: "border-red-500/30 bg-red-500/5", dot: "bg-red-500" },
] as const;

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  stage: string;
  value: number | null;
  notes: string | null;
}

export default function CrmPage() {
  const { activeBrand } = useBrand();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "", value: "" });

  useEffect(() => {
    if (!activeBrand) return;
    setLoading(true);
    fetch(`/api/crm?brandId=${activeBrand.id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setError(d.error ?? "Veriler yüklenemedi"); return; }
        setLeads(d.leads ?? []);
        setError("");
      })
      .catch(() => setError("Sunucuya bağlanılamadı"))
      .finally(() => setLoading(false));
  }, [activeBrand?.id]);

  async function handleCreate() {
    if (!activeBrand || !form.name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId: activeBrand.id,
          name: form.name,
          email: form.email || null,
          phone: form.phone || null,
          company: form.company || null,
          source: form.source || null,
          value: form.value ? parseInt(form.value) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLeads([data.lead, ...leads]);
        setForm({ name: "", email: "", phone: "", company: "", source: "", value: "" });
        setShowForm(false);
      }
    } catch { /* ignore */ }
    setCreating(false);
  }

  async function moveStage(id: string, stage: string) {
    const res = await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage }),
    });
    if (res.ok) {
      setLeads(leads.map((l) => (l.id === id ? { ...l, stage } : l)));
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/crm?id=${id}`, { method: "DELETE" });
    setLeads(leads.filter((l) => l.id !== id));
  }

  const inp = "w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;

  const totalValue = leads.filter((l) => l.stage === "WON" && l.value).reduce((s, l) => s + (l.value ?? 0), 0);
  const pipelineValue = leads.filter((l) => !["WON", "LOST"].includes(l.stage) && l.value).reduce((s, l) => s + (l.value ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
            <UserPlus className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">CRM & Pipeline</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {leads.length} müşteri adayı · Pipeline: {pipelineValue.toLocaleString("tr-TR")}₺ · Kazanılan: {totalValue.toLocaleString("tr-TR")}₺
            </p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Yeni Aday
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

      {showForm && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="mb-4 font-semibold">Yeni Müşteri Adayı</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <input className={inp} placeholder="Ad Soyad *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inp} placeholder="E-posta" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={inp} placeholder="Telefon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className={inp} placeholder="Şirket" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className={inp} placeholder="Kaynak (web, referans...)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <input className={inp} placeholder="Tahmini değer (₺)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
          <button onClick={handleCreate} disabled={creating || !form.name}
            className="mt-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ekle
          </button>
        </section>
      )}

      {/* Kanban Pipeline */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.value);
          return (
            <div key={stage.value} className={`rounded-2xl border p-3 ${stage.color}`}>
              <div className="mb-3 flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                <span className="text-xs font-bold">{stage.label}</span>
                <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{stageLeads.length}</span>
              </div>
              <div className="space-y-2">
                {stageLeads.map((lead) => (
                  <div key={lead.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-semibold">{lead.name}</p>
                      <button onClick={() => handleDelete(lead.id)} className="text-red-400 hover:text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {lead.company && <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]"><Building className="h-3 w-3" />{lead.company}</p>}
                    {lead.email && <p className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]"><Mail className="h-3 w-3" />{lead.email}</p>}
                    {lead.phone && <p className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]"><Phone className="h-3 w-3" />{lead.phone}</p>}
                    {lead.value && <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500"><DollarSign className="h-3 w-3" />{lead.value.toLocaleString("tr-TR")}₺</p>}
                    <select className="mt-2 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-[11px]"
                      value={lead.stage} onChange={(e) => moveStage(lead.id, e.target.value)}>
                      {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
