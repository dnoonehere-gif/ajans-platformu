"use client";
import { useEffect, useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, Plus, Trash2, UserPlus, Phone, Mail, Building, DollarSign, MessageSquare, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    stages: { NEW: "Yeni", CONTACTED: "İletişime Geçildi", QUALIFIED: "Nitelikli", PROPOSAL: "Teklif", WON: "Kazanıldı", LOST: "Kaybedildi" },
    loadFail: "Veriler yüklenemedi", connFail: "Sunucuya bağlanılamadı",
    added: "eklendi", deleted: "silindi", noteSaved: "Not kaydedildi",
    deleteConfirm: (name: string) => `${name} adlı müşteri adayını silmek istediğinize emin misiniz?`,
    title: "CRM & Pipeline",
    summary: (n: number, pipe: string, won: string) => `${n} müşteri adayı · Pipeline: ${pipe}₺ · Kazanılan: ${won}₺`,
    activity: "Aktivite", newLead: "Yeni Aday",
    recentActivities: "Son Aktiviteler",
    formTitle: "Yeni Müşteri Adayı",
    ph: { name: "Ad Soyad *", email: "E-posta", phone: "Telefon", company: "Şirket", source: "Kaynak (web, referans...)", value: "Tahmini değer (₺)" },
    addBtn: "Ekle",
    notePh: "Not ekle...", noteSave: "Kaydet", noteCancel: "İptal", addNote: "Not ekle",
  },
  en: {
    stages: { NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified", PROPOSAL: "Proposal", WON: "Won", LOST: "Lost" },
    loadFail: "Failed to load data", connFail: "Could not reach the server",
    added: "added", deleted: "deleted", noteSaved: "Note saved",
    deleteConfirm: (name: string) => `Are you sure you want to delete the lead "${name}"?`,
    title: "CRM & Pipeline",
    summary: (n: number, pipe: string, won: string) => `${n} leads · Pipeline: ${pipe}₺ · Won: ${won}₺`,
    activity: "Activity", newLead: "New Lead",
    recentActivities: "Recent Activities",
    formTitle: "New Lead",
    ph: { name: "Full name *", email: "Email", phone: "Phone", company: "Company", source: "Source (web, referral...)", value: "Estimated value (₺)" },
    addBtn: "Add",
    notePh: "Add a note...", noteSave: "Save", noteCancel: "Cancel", addNote: "Add note",
  },
};

const STAGES = [
  { value: "NEW", label: "Yeni", color: "border-blue-500/30 bg-blue-500/5", dot: "bg-blue-500" },
  { value: "CONTACTED", label: "İletişime Geçildi", color: "border-violet-500/30 bg-violet-500/5", dot: "bg-violet-500" },
  { value: "QUALIFIED", label: "Nitelikli", color: "border-amber-500/30 bg-amber-500/5", dot: "bg-amber-500" },
  { value: "PROPOSAL", label: "Teklif", color: "border-orange-500/30 bg-orange-500/5", dot: "bg-orange-500" },
  { value: "WON", label: "Kazanıldı", color: "border-emerald-500/30 bg-emerald-500/5", dot: "bg-emerald-500" },
  { value: "LOST", label: "Kaybedildi", color: "border-red-500/30 bg-red-500/5", dot: "bg-red-500" },
] as const;

const STAGE_LABELS: Record<string, string> = Object.fromEntries(STAGES.map((s) => [s.value, s.label]));

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

interface Activity {
  leadName: string;
  from: string;
  to: string;
  time: Date;
}

export default function CrmPage() {
  const { activeBrand } = useBrand();
  const { lang } = useLang();
  const sL = L[lang];
  const stageLabel = (v: string) => sL.stages[v as keyof typeof sL.stages] ?? v;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showActivities, setShowActivities] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "", value: "" });

  useEffect(() => {
    if (!activeBrand) return;
    setLoading(true);
    fetch(`/api/crm?brandId=${activeBrand.id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setError(d.error ?? sL.loadFail); return; }
        setLeads(d.leads ?? []);
        setError("");
      })
      .catch(() => setError(sL.connFail))
      .finally(() => setLoading(false));
  }, [activeBrand?.id]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

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
        showToast(`${data.lead.name} ${sL.added}`);
      }
    } catch { /* ignore */ }
    setCreating(false);
  }

  async function moveStage(id: string, newStage: string) {
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === newStage) return;

    const oldStage = lead.stage;
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage: newStage } : l)));

    const res = await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage: newStage }),
    });
    if (res.ok) {
      setActivities((prev) => [{ leadName: lead.name, from: oldStage, to: newStage, time: new Date() }, ...prev.slice(0, 19)]);
      const wonLost = newStage === "WON" ? " 🎉" : newStage === "LOST" ? " ⚠️" : "";
      showToast(`${lead.name}: ${stageLabel(oldStage)} → ${stageLabel(newStage)}${wonLost}`);
    } else {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage: oldStage } : l)));
    }
  }

  async function saveNotes(id: string) {
    await fetch("/api/crm", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, notes: notesDraft || null }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: notesDraft || null } : l)));
    setEditingNotes(null);
    showToast(sL.noteSaved);
  }

  async function handleDelete(id: string) {
    const lead = leads.find((l) => l.id === id);
    if (!lead || !confirm(sL.deleteConfirm(lead.name))) return;
    await fetch(`/api/crm?id=${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    showToast(`${lead.name} ${sL.deleted}`);
  }

  const inp = "w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;

  const totalValue = leads.filter((l) => l.stage === "WON" && l.value).reduce((s, l) => s + (l.value ?? 0), 0);
  const pipelineValue = leads.filter((l) => !["WON", "LOST"].includes(l.stage) && l.value).reduce((s, l) => s + (l.value ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-bottom-4">
          <Check className="h-4 w-4 text-emerald-500" />
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
            <UserPlus className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{sL.title}</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {sL.summary(leads.length, pipelineValue.toLocaleString("tr-TR"), totalValue.toLocaleString("tr-TR"))}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activities.length > 0 && (
            <button onClick={() => setShowActivities(!showActivities)}
              className="flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs font-medium transition hover:bg-[hsl(var(--accent))]">
              {showActivities ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {sL.activity} ({activities.length})
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
            <Plus className="h-4 w-4" /> {sL.newLead}
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

      {/* Aktivite geçmişi */}
      {showActivities && activities.length > 0 && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <h3 className="mb-3 text-sm font-semibold">{sL.recentActivities}</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="font-medium text-[hsl(var(--foreground))]">{a.leadName}</span>
                <span>{stageLabel(a.from)} → {stageLabel(a.to)}</span>
                <span className="ml-auto">{a.time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {showForm && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="mb-4 font-semibold">{sL.formTitle}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <input className={inp} placeholder={sL.ph.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inp} placeholder={sL.ph.email} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className={inp} placeholder={sL.ph.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className={inp} placeholder={sL.ph.company} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <input className={inp} placeholder={sL.ph.source} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <input className={inp} placeholder={sL.ph.value} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
          </div>
          <button onClick={handleCreate} disabled={creating || !form.name}
            className="mt-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {sL.addBtn}
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
                <span className="text-xs font-bold">{stageLabel(stage.value)}</span>
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
                    {lead.value != null && lead.value > 0 && <p className="flex items-center gap-1 text-[11px] font-semibold text-emerald-500"><DollarSign className="h-3 w-3" />{lead.value.toLocaleString("tr-TR")}₺</p>}

                    {/* Not */}
                    {editingNotes === lead.id ? (
                      <div className="mt-2">
                        <textarea className={inp + " h-16 resize-none text-[11px]"} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder={sL.notePh} />
                        <div className="mt-1 flex gap-1">
                          <button onClick={() => saveNotes(lead.id)} className="rounded bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-semibold text-white">{sL.noteSave}</button>
                          <button onClick={() => setEditingNotes(null)} className="rounded bg-[hsl(var(--accent))] px-2 py-0.5 text-[10px]">{sL.noteCancel}</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingNotes(lead.id); setNotesDraft(lead.notes ?? ""); }}
                        className="mt-2 flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition">
                        <MessageSquare className="h-3 w-3" />
                        {lead.notes ? lead.notes.slice(0, 30) + (lead.notes.length > 30 ? "..." : "") : sL.addNote}
                      </button>
                    )}

                    <select className="mt-2 w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-[11px]"
                      value={lead.stage} onChange={(e) => moveStage(lead.id, e.target.value)}>
                      {STAGES.map((s) => <option key={s.value} value={s.value}>{stageLabel(s.value)}</option>)}
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
