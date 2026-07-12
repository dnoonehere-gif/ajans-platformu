"use client";
import { useEffect, useState } from "react";
import { useBrand } from "@/components/dashboard/brand-provider";
import { Loader2, Mail, Plus, Trash2, Users, Send, FileText } from "lucide-react";

interface Campaign {
  id: string;
  subject: string;
  body: string;
  status: string;
  sentCount: number;
  openCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

export default function EmailKampanyaPage() {
  const { activeBrand } = useBrand();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tab, setTab] = useState<"campaigns" | "contacts">("campaigns");

  // Kişi ekleme
  const [contactEmail, setContactEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  useEffect(() => {
    if (!activeBrand) return;
    setLoading(true);
    fetch(`/api/email-campaigns?brandId=${activeBrand.id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setError(d.error ?? "Veriler yüklenemedi"); return; }
        setCampaigns(d.campaigns ?? []);
        setContactCount(d.contactCount ?? 0);
        setError("");
      })
      .catch(() => setError("Sunucuya bağlanılamadı"))
      .finally(() => setLoading(false));
  }, [activeBrand?.id]);

  async function handleCreate() {
    if (!activeBrand || !subject || !body) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/email-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: activeBrand.id, subject, body, status: "DRAFT" }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Oluşturulamadı");
      else {
        setCampaigns([data.campaign, ...campaigns]);
        setSubject("");
        setBody("");
        setShowForm(false);
      }
    } catch { setError("Bağlantı hatası"); }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/email-campaigns?id=${id}`, { method: "DELETE" });
    setCampaigns(campaigns.filter((c) => c.id !== id));
  }

  async function handleAddContact() {
    if (!activeBrand || !contactEmail) return;
    setAddingContact(true);
    try {
      const res = await fetch("/api/email-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: activeBrand.id, contacts: [{ email: contactEmail, name: contactName || undefined }] }),
      });
      const data = await res.json();
      if (res.ok) {
        setContactCount((c) => c + data.added);
        setContactEmail("");
        setContactName("");
      }
    } catch { /* ignore */ }
    setAddingContact(false);
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

  const inp = "w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]";

  const statusLabel: Record<string, { text: string; cls: string }> = {
    DRAFT: { text: "Taslak", cls: "bg-slate-500/10 text-slate-500" },
    SCHEDULED: { text: "Planlandı", cls: "bg-violet-500/10 text-violet-500" },
    SENDING: { text: "Gönderiliyor", cls: "bg-amber-500/10 text-amber-500" },
    SENT: { text: "Gönderildi", cls: "bg-emerald-500/10 text-emerald-500" },
    FAILED: { text: "Başarısız", cls: "bg-red-500/10 text-red-500" },
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--muted-foreground))]" /></div>;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">E-posta Pazarlama</h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{contactCount} kişi · {campaigns.length} kampanya</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setTab("campaigns"); }}
          className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Yeni Kampanya
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

      {/* Tab */}
      <div className="flex gap-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
        <button onClick={() => setTab("campaigns")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === "campaigns" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
          <FileText className="mr-1.5 inline h-4 w-4" /> Kampanyalar
        </button>
        <button onClick={() => setTab("contacts")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === "contacts" ? "bg-[hsl(var(--primary))] text-white" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>
          <Users className="mr-1.5 inline h-4 w-4" /> Kişiler ({contactCount})
        </button>
      </div>

      {tab === "campaigns" && (
        <>
          {showForm && (
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
              <h2 className="mb-4 font-semibold">Yeni Kampanya</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">Konu</label>
                  <input className={inp} placeholder="E-posta konusu" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">İçerik (HTML destekli)</label>
                  <textarea className={inp + " h-40 resize-none font-mono text-xs"} placeholder="<h1>Merhaba!</h1><p>Kampanya içeriğiniz...</p>"
                    value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
              </div>
              <button onClick={handleCreate} disabled={creating || !subject || !body}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {creating ? "Oluşturuluyor..." : "Taslak Oluştur"}
              </button>
            </section>
          )}

          <section className="space-y-3">
            {campaigns.length === 0 ? (
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
                <Mail className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Henüz kampanya yok</p>
              </div>
            ) : campaigns.map((c) => {
              const st = statusLabel[c.status] ?? statusLabel.DRAFT;
              return (
                <div key={c.id} className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <Mail className="h-5 w-5 shrink-0 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{c.subject}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}>{st.text}</span>
                    </div>
                    <div className="mt-0.5 flex gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                      <span>{formatDate(c.createdAt)}</span>
                      {c.sentCount > 0 && <span>📤 {c.sentCount}</span>}
                      {c.openCount > 0 && <span>👁 {c.openCount}</span>}
                    </div>
                  </div>
                  {c.status === "DRAFT" && (
                    <button onClick={() => handleDelete(c.id)} className="shrink-0 text-red-400 transition hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </section>
        </>
      )}

      {tab === "contacts" && (
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <h2 className="mb-4 font-semibold">Kişi Ekle</h2>
          <div className="flex gap-3">
            <input className={inp} placeholder="E-posta" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            <input className={inp + " max-w-[150px]"} placeholder="İsim (opsiyonel)" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            <button onClick={handleAddContact} disabled={addingContact || !contactEmail}
              className="shrink-0 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
              {addingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">Toplu ekleme için CSV import yakında eklenecek.</p>
        </section>
      )}
    </div>
  );
}
