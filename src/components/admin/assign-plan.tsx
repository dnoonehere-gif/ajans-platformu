"use client";
import { useState, useEffect } from "react";
import { CreditCard, Loader2, Search, Check, X, ShieldAlert } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    title: "Kullanıcıya Plan Tanımla",
    sub: "Rolü değiştirmez — yalnızca abonelik açar",
    email: "Kullanıcı e-postası",
    emailPh: "ornek@eposta.com",
    check: "Sorgula",
    plan: "Plan",
    duration: "Süre",
    months: (n: number) => `${n} ay`,
    unlimited: "Süresiz",
    assign: "Planı Tanımla",
    assigning: "Tanımlanıyor...",
    cancel: "Aboneliği İptal Et",
    current: "Mevcut durum",
    role: "Rol",
    verified: "E-posta doğrulanmış",
    notVerified: "E-posta doğrulanmamış",
    noBrand: "Markası yok",
    noSub: "Aktif aboneliği yok",
    until: "bitiş",
    done: (p: string, b: string) => `${p} planı "${b}" markasına tanımlandı.`,
    canceled: (n: number) => `${n} abonelik iptal edildi.`,
    err: "Bir hata oluştu",
    warnAdmin: "Bu kullanıcı SUPER_ADMIN — tüm admin paneline erişimi var.",
  },
  en: {
    title: "Assign Plan to User",
    sub: "Does not change the role — only creates a subscription",
    email: "User email",
    emailPh: "user@example.com",
    check: "Look up",
    plan: "Plan",
    duration: "Duration",
    months: (n: number) => `${n} months`,
    unlimited: "Unlimited",
    assign: "Assign Plan",
    assigning: "Assigning...",
    cancel: "Cancel Subscription",
    current: "Current status",
    role: "Role",
    verified: "Email verified",
    notVerified: "Email not verified",
    noBrand: "No brand",
    noSub: "No active subscription",
    until: "ends",
    done: (p: string, b: string) => `${p} plan assigned to brand "${b}".`,
    canceled: (n: number) => `${n} subscription(s) canceled.`,
    err: "Something went wrong",
    warnAdmin: "This user is SUPER_ADMIN — they have full admin panel access.",
  },
};

interface Plan { slug: string; name: string; interval: string }
interface Found {
  email: string; name: string | null; globalRole: string; emailVerified: string | null;
  ownedBrands: { id: string; name: string; subscriptions: { status: string; endsAt: string | null; plan: { name: string } }[] }[];
}

export function AssignPlan() {
  const { lang } = useLang();
  const s = L[lang];

  const [plans, setPlans] = useState<Plan[]>([]);
  const [email, setEmail] = useState("");
  const [planSlug, setPlanSlug] = useState("");
  const [months, setMonths] = useState(0);
  const [found, setFound] = useState<Found | null>(null);
  const [busy, setBusy] = useState<"" | "check" | "assign" | "cancel">("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/plans")
      .then((r) => r.json())
      .then((d) => {
        const list: Plan[] = (d.plans ?? []).filter((p: Plan & { isActive?: boolean }) => p.interval === "month");
        setPlans(list);
        if (list[0]) setPlanSlug(list[0].slug);
      })
      .catch(() => null);
  }, []);

  async function lookup() {
    if (!email.trim()) return;
    setBusy("check"); setMsg(null); setFound(null);
    try {
      const r = await fetch(`/api/admin/subscription?email=${encodeURIComponent(email.trim())}`);
      const d = await r.json();
      if (!r.ok) setMsg({ ok: false, text: d.error ?? s.err });
      else setFound(d.user);
    } catch { setMsg({ ok: false, text: s.err }); }
    setBusy("");
  }

  async function assign() {
    setBusy("assign"); setMsg(null);
    try {
      const r = await fetch("/api/admin/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), planSlug, months }),
      });
      const d = await r.json();
      if (!r.ok) setMsg({ ok: false, text: d.error ?? s.err });
      else { setMsg({ ok: true, text: s.done(d.plan, d.brand) }); lookup(); }
    } catch { setMsg({ ok: false, text: s.err }); }
    setBusy("");
  }

  async function cancelSub() {
    setBusy("cancel"); setMsg(null);
    try {
      const r = await fetch(`/api/admin/subscription?email=${encodeURIComponent(email.trim())}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) setMsg({ ok: false, text: d.error ?? s.err });
      else { setMsg({ ok: true, text: s.canceled(d.canceled) }); lookup(); }
    } catch { setMsg({ ok: false, text: s.err }); }
    setBusy("");
  }

  const inp = "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2.5 text-sm outline-none transition focus:border-[hsl(var(--primary))]";

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.12)]">
          <CreditCard className="h-4 w-4 text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h2 className="font-semibold">{s.title}</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{s.sub}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{s.email}</label>
          <input
            className={`${inp} w-full`}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFound(null); }}
            onKeyDown={(e) => { if (e.key === "Enter") lookup(); }}
            placeholder={s.emailPh}
          />
        </div>
        <button
          onClick={lookup}
          disabled={busy === "check" || !email.trim()}
          className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-2.5 text-sm transition hover:bg-[hsl(var(--accent))] disabled:opacity-50"
        >
          {busy === "check" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {s.check}
        </button>
      </div>

      {found && (
        <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.35)] p-4 text-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{s.current}</p>
          <p className="font-medium">{found.name ?? "—"} <span className="text-[hsl(var(--muted-foreground))]">· {found.email}</span></p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            {s.role}: {found.globalRole} · {found.emailVerified ? s.verified : s.notVerified}
          </p>

          {found.globalRole === "SUPER_ADMIN" && (
            <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-orange-500/10 px-3 py-2 text-xs text-orange-400">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> {s.warnAdmin}
            </p>
          )}

          <div className="mt-3 space-y-1.5">
            {found.ownedBrands.length === 0 && (
              <p className="text-xs text-orange-400">{s.noBrand}</p>
            )}
            {found.ownedBrands.map((b) => {
              const sub = b.subscriptions[0];
              return (
                <p key={b.id} className="text-xs">
                  <span className="font-medium">{b.name}</span>{" "}
                  {sub
                    ? <span className="text-green-400">· {sub.plan.name} ({sub.status}){sub.endsAt ? ` · ${s.until}: ${new Date(sub.endsAt).toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR")}` : ""}</span>
                    : <span className="text-[hsl(var(--muted-foreground))]">· {s.noSub}</span>}
                </p>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{s.plan}</label>
          <select className={inp} value={planSlug} onChange={(e) => setPlanSlug(e.target.value)}>
            {plans.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">{s.duration}</label>
          <select className={inp} value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={0}>{s.unlimited}</option>
            {[1, 3, 6, 12].map((m) => <option key={m} value={m}>{s.months(m)}</option>)}
          </select>
        </div>
        <button
          onClick={assign}
          disabled={busy === "assign" || !email.trim() || !planSlug}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy === "assign" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {busy === "assign" ? s.assigning : s.assign}
        </button>
        <button
          onClick={cancelSub}
          disabled={busy === "cancel" || !email.trim()}
          className="flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          {busy === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          {s.cancel}
        </button>
      </div>

      {msg && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
