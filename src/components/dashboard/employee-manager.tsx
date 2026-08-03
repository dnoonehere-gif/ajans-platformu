"use client";
import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Users, Pencil, Check, X } from "lucide-react";

/**
 * Çalışan yönetimi.
 *
 * Şubeler sayfası çalışan SAYISINI gösteriyordu ama çalışan eklemenin hiçbir
 * yolu yoktu; sayaç kalıcı olarak 0'da kalıyordu. Burada ekleme, düzenleme,
 * silme ve şubeye atama yapılır.
 */

interface Branch {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  fullName: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  branch?: { id: string; name: string } | null;
}

const inp =
  "w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))] placeholder:text-[hsl(var(--muted-foreground))]";

const BOS = { fullName: "", title: "", email: "", phone: "", branchId: "" };

export function EmployeeManager({
  brandId,
  branches,
  onChange,
}: {
  brandId: string;
  branches: Branch[];
  /** Çalışan sayısı değişince şube sayaçlarını tazelemek için */
  onChange?: () => void;
}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [form, setForm] = useState(BOS);
  const [formAcik, setFormAcik] = useState(false);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<string | null>(null);
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/employees`);
      const data = await res.json();
      setEmployees(data.employees ?? []);
    } catch {
      setEmployees([]);
    }
    setYukleniyor(false);
  }, [brandId]);

  useEffect(() => { void yukle(); }, [yukle]);

  async function kaydet() {
    if (form.fullName.trim().length < 2) { setHata("Ad soyad en az 2 karakter olmalı"); return; }
    setKaydediyor(true);
    setHata("");

    const duzenleme = Boolean(duzenlenen);
    const res = await fetch(
      duzenleme ? `/api/brand/${brandId}/employees/${duzenlenen}` : `/api/brand/${brandId}/employees`,
      {
        method: duzenleme ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json();
    setKaydediyor(false);

    if (!res.ok) { setHata(data.error ?? "Kaydedilemedi"); return; }

    setForm(BOS);
    setFormAcik(false);
    setDuzenlenen(null);
    await yukle();
    onChange?.();
  }

  async function sil(id: string) {
    if (!confirm("Çalışan silinecek. Emin misiniz?")) return;
    const res = await fetch(`/api/brand/${brandId}/employees/${id}`, { method: "DELETE" });
    if (res.ok) { await yukle(); onChange?.(); }
  }

  function duzenlemeyeAl(e: Employee) {
    setDuzenlenen(e.id);
    setFormAcik(true);
    setHata("");
    setForm({
      fullName: e.fullName,
      title: e.title ?? "",
      email: e.email ?? "",
      phone: e.phone ?? "",
      branchId: e.branch?.id ?? "",
    });
  }

  return (
    <div className="glass mt-6 rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[hsl(var(--primary))]" />
          <p className="font-semibold">Çalışanlar</p>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">({employees.length})</span>
        </div>
        {!formAcik && (
          <button
            onClick={() => { setFormAcik(true); setDuzenlenen(null); setForm(BOS); setHata(""); }}
            className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Çalışan Ekle
          </button>
        )}
      </div>

      {formAcik && (
        <div className="mb-4 space-y-3 rounded-2xl border border-[hsl(var(--border))] p-4">
          <input className={inp} placeholder="Ad soyad" value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={inp} placeholder="Görev (örn. Kuaför)" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className={inp} placeholder="Telefon" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <input className={inp} placeholder="E-posta (isteğe bağlı)" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className={inp} value={form.branchId}
            onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
            <option value="">Şube atanmadı</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>

          {hata && <p className="text-xs text-red-400">{hata}</p>}

          <div className="flex gap-2">
            <button onClick={kaydet} disabled={kaydediyor}
              className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {kaydediyor ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {duzenlenen ? "Güncelle" : "Kaydet"}
            </button>
            <button onClick={() => { setFormAcik(false); setDuzenlenen(null); setForm(BOS); setHata(""); }}
              className="flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] px-4 py-2 text-xs transition hover:bg-[hsl(var(--accent))]">
              <X className="h-3.5 w-3.5" /> Vazgeç
            </button>
          </div>
        </div>
      )}

      {yukleniyor ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Yükleniyor...</p>
      ) : employees.length === 0 ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Henüz çalışan eklenmemiş. Çalışan eklerseniz hangi şubede kimin çalıştığını takip edebilirsiniz.
        </p>
      ) : (
        <div className="space-y-2">
          {employees.map((e) => (
            <div key={e.id} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-3.5 py-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-xs font-bold text-[hsl(var(--primary))]">
                {e.fullName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{e.fullName}</p>
                <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                  {[e.title, e.branch?.name ?? "Şube atanmadı", e.phone].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button onClick={() => duzenlemeyeAl(e)} title="Düzenle"
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))]">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => sil(e.id)} title="Sil"
                className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
