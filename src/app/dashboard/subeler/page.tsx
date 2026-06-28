"use client";
import { useState, useEffect } from "react";
import { MapPin, Phone, Plus, Pencil, Trash2, Loader2, Check, X, Users, Building2 } from "lucide-react";
import { useBrand } from "@/components/dashboard/brand-provider";

interface Branch {
  id: string; name: string; address: string | null; phone: string | null;
  lat: number | null; lng: number | null; createdAt: string;
  _count: { employees: number };
}

const inputCls = "flex h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] placeholder:text-[hsl(var(--muted-foreground))]";

function BranchForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: Partial<Branch>; onSave: (d: Partial<Branch>) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    address: initial?.address ?? "",
    phone: initial?.phone ?? "",
  });
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Şube Adı *</label>
        <input className={inputCls} placeholder="Kadıköy" value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Adres</label>
        <input className={inputCls} placeholder="Moda Cad. No:5, Kadıköy" value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-[hsl(var(--muted-foreground))]">Telefon</label>
        <input className={inputCls} placeholder="0216 xxx xx xx" value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      </div>
      <div className="col-span-full flex gap-2">
        <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          {initial?.id ? "Kaydet" : "Ekle"}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-sm transition hover:bg-[hsl(var(--accent))]">
          <X className="h-3.5 w-3.5" /> İptal
        </button>
      </div>
    </div>
  );
}

export default function SubelerPage() {
  const { activeBrand } = useBrand();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeBrand) return;
    setLoading(true);
    fetch(`/api/brand/${activeBrand.id}/branches`)
      .then((r) => r.json())
      .then((d) => { setBranches(d.branches ?? []); setLoading(false); });
  }, [activeBrand?.id]);

  async function addBranch(data: Partial<Branch>) {
    if (!activeBrand) return;
    setSaving(true);
    const res = await fetch(`/api/brand/${activeBrand.id}/branches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.branch) { setBranches((b) => [...b, json.branch]); setShowAdd(false); }
    setSaving(false);
  }

  async function updateBranch(id: string, data: Partial<Branch>) {
    if (!activeBrand) return;
    setSaving(true);
    const res = await fetch(`/api/brand/${activeBrand.id}/branches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.branch) { setBranches((b) => b.map((x) => x.id === id ? json.branch : x)); setEditId(null); }
    setSaving(false);
  }

  async function deleteBranch(id: string) {
    if (!activeBrand || !confirm("Bu şubeyi silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    await fetch(`/api/brand/${activeBrand.id}/branches/${id}`, { method: "DELETE" });
    setBranches((b) => b.filter((x) => x.id !== id));
    setDeletingId(null);
  }

  if (!activeBrand) return (
    <div className="flex h-64 items-center justify-center text-[hsl(var(--muted-foreground))]">
      Önce bir marka seçin
    </div>
  );

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Şubeler</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            <span className="font-semibold text-[hsl(var(--foreground))]">{activeBrand.name}</span> · {branches.length} şube
          </p>
        </div>
        {!showAdd && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            <Plus className="h-4 w-4" /> Şube Ekle
          </button>
        )}
      </div>

      {/* Yeni şube formu */}
      {showAdd && (
        <div className="glass mb-4 rounded-2xl p-5">
          <p className="mb-4 text-sm font-semibold">Yeni Şube</p>
          <BranchForm onSave={addBranch} onCancel={() => setShowAdd(false)} saving={saving} />
        </div>
      )}

      {/* Şube listesi */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : branches.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[hsl(var(--border))] py-20">
          <Building2 className="h-12 w-12 text-[hsl(var(--muted-foreground))/0.4]" />
          <div className="text-center">
            <p className="font-semibold">Henüz şube yok</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">İlk şubenizi ekleyin</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            <Plus className="h-4 w-4" /> Şube Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {branches.map((branch, i) => (
            <div key={branch.id} className="glass rounded-2xl overflow-hidden">
              {editId === branch.id ? (
                <div className="p-5">
                  <p className="mb-4 text-sm font-semibold">Şubeyi Düzenle</p>
                  <BranchForm initial={branch} onSave={(d) => updateBranch(branch.id, d)}
                    onCancel={() => setEditId(null)} saving={saving} />
                </div>
              ) : (
                <div className="flex items-center gap-4 p-5">
                  {/* Numara */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)] text-sm font-black text-[hsl(var(--primary))]">
                    {i + 1}
                  </div>

                  {/* Bilgiler */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{branch.name}</p>
                    <div className="mt-1 flex flex-wrap gap-3">
                      {branch.address && (
                        <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                          <MapPin className="h-3 w-3" /> {branch.address}
                        </span>
                      )}
                      {branch.phone && (
                        <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                          <Phone className="h-3 w-3" /> {branch.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                        <Users className="h-3 w-3" /> {branch._count.employees} çalışan
                      </span>
                    </div>
                  </div>

                  {/* Aksiyonlar */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => setEditId(branch.id)}
                      className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteBranch(branch.id)} disabled={deletingId === branch.id}
                      className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50">
                      {deletingId === branch.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Özet */}
      {branches.length > 0 && (
        <div className="mt-6 glass rounded-2xl p-5">
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-2xl font-bold">{branches.length}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Toplam Şube</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{branches.reduce((a, b) => a + b._count.employees, 0)}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Toplam Çalışan</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{branches.filter((b) => b.address).length}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Adres Girilmiş</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
