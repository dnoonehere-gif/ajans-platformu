"use client";
import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Trash2, ChevronDown, Loader2, Crown, Shield, Edit3, Eye } from "lucide-react";
import type { BrandRole, GlobalRole } from "@prisma/client";

interface Member {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  globalRole: GlobalRole;
  brandRole: BrandRole;
  isOwner: boolean;
  memberId?: string;
}

const BRAND_ROLES: { value: BrandRole; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { value: "OWNER",   label: "Sahip",    desc: "Tam yetki",                 icon: Crown,  color: "text-yellow-400" },
  { value: "MANAGER", label: "Yönetici", desc: "İçerik + üye yönetimi",     icon: Shield, color: "text-blue-400" },
  { value: "EDITOR",  label: "Editör",   desc: "İçerik oluşturabilir",       icon: Edit3,  color: "text-green-400" },
  { value: "VIEWER",  label: "İzleyici", desc: "Sadece görüntüleme",         icon: Eye,    color: "text-[hsl(var(--muted-foreground))]" },
];

const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
  SUPER_ADMIN: "Süper Admin",
  ADMIN: "Admin",
  CUSTOMER: "Müşteri",
  STAFF: "Personel",
};

function RoleIcon({ role }: { role: BrandRole }) {
  const info = BRAND_ROLES.find((r) => r.value === role);
  if (!info) return null;
  return <info.icon className={`h-3.5 w-3.5 ${info.color}`} />;
}

function Avatar({ name, email, avatarUrl }: { name?: string | null; email: string; avatarUrl?: string | null }) {
  if (avatarUrl) return <img src={avatarUrl} alt={name ?? email} className="h-9 w-9 rounded-full object-cover" />;
  const initials = (name ?? email).slice(0, 2).toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.2)] text-sm font-bold text-[hsl(var(--primary))]">
      {initials}
    </div>
  );
}

export default function TeamPage() {
  const [brandId, setBrandId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [owner, setOwner] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<BrandRole>("EDITOR");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/brand/${brandId}/members`);
    const data = await res.json();
    if (data.owner) setOwner(data.owner);
    if (data.members) setMembers(data.members);
    setLoading(false);
  }, [brandId]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    const res = await fetch(`/api/brand/${brandId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json();
    if (data.member) {
      setMembers((m) => {
        const exists = m.find((x) => x.id === data.member.id);
        return exists ? m.map((x) => x.id === data.member.id ? data.member : x) : [data.member, ...m];
      });
      setInviteEmail("");
    } else {
      setInviteError(data.error ?? "Hata oluştu");
    }
    setInviting(false);
  }

  async function updateRole(userId: string, role: BrandRole) {
    setUpdatingId(userId);
    const res = await fetch(`/api/brand/${brandId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (data.role) {
      setMembers((m) => m.map((x) => x.id === userId ? { ...x, brandRole: data.role } : x));
    }
    setUpdatingId(null);
  }

  async function removeMember(userId: string) {
    setRemovingId(userId);
    await fetch(`/api/brand/${brandId}/members/${userId}`, { method: "DELETE" });
    setMembers((m) => m.filter((x) => x.id !== userId));
    setRemovingId(null);
  }

  const allMembers = owner ? [owner, ...members] : members;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Başlık */}
      <div className="mb-8 flex items-center gap-3">
        <Users className="h-8 w-8 text-[hsl(var(--primary))]" />
        <div>
          <h1 className="text-2xl font-bold">Takım Yönetimi</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Marka üyelerini yönet, rol ve erişim izinlerini ayarla.</p>
        </div>
      </div>

      {/* Marka ID */}
      {!loaded && (
        <div className="glass mb-8 flex gap-2 rounded-2xl p-5">
          <input type="text" placeholder="Marka ID gir..." value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && brandId.trim()) { setLoaded(true); load(); } }}
            className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
          <button onClick={() => { if (brandId.trim()) { setLoaded(true); load(); } }}
            className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
            Yükle
          </button>
        </div>
      )}

      {loaded && (
        <div className="space-y-5">
          {/* Rol açıklamaları */}
          <div className="glass rounded-2xl p-5">
            <p className="mb-3 text-sm font-semibold">Marka Rolleri</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {BRAND_ROLES.map((r) => (
                <div key={r.value} className="rounded-xl bg-[hsl(var(--muted)/0.5)] p-3">
                  <div className={`mb-1 flex items-center gap-1.5 text-xs font-semibold ${r.color}`}>
                    <r.icon className="h-3.5 w-3.5" /> {r.label}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Davet formu */}
          <form onSubmit={invite} className="glass rounded-2xl p-5">
            <p className="mb-3 text-sm font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-[hsl(var(--primary))]" /> Üye Ekle
            </p>
            <div className="flex gap-2">
              <input type="email" required placeholder="ornek@email.com" value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition" />
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as BrandRole)}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))] transition">
                {BRAND_ROLES.filter((r) => r.value !== "OWNER").map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <button type="submit" disabled={inviting}
                className="flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Ekle
              </button>
            </div>
            {inviteError && <p className="mt-2 text-xs text-red-400">{inviteError}</p>}
          </form>

          {/* Üye listesi */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[hsl(var(--border))]">
                <p className="text-sm font-semibold">{allMembers.length} Üye</p>
              </div>
              <div className="divide-y divide-[hsl(var(--border))]">
                {allMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                    <Avatar name={member.name} email={member.email} avatarUrl={member.avatarUrl} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{member.name ?? member.email}</p>
                        {member.isOwner && (
                          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">Sahip</span>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{member.email}</p>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">·</span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {GLOBAL_ROLE_LABELS[member.globalRole]}
                        </span>
                      </div>
                    </div>

                    {/* Marka rolü */}
                    {member.isOwner ? (
                      <div className="flex items-center gap-1.5 rounded-lg bg-yellow-500/10 px-3 py-1.5">
                        <Crown className="h-3.5 w-3.5 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-400">Sahip</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {updatingId === member.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--muted-foreground))]" />
                        ) : (
                          <div className="relative">
                            <select
                              value={member.brandRole}
                              onChange={(e) => updateRole(member.id, e.target.value as BrandRole)}
                              className="appearance-none rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] pl-7 pr-7 py-1.5 text-xs font-medium outline-none focus:border-[hsl(var(--primary))] transition cursor-pointer"
                            >
                              {BRAND_ROLES.filter((r) => r.value !== "OWNER").map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <RoleIcon role={member.brandRole} />
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                          </div>
                        )}
                        <button
                          onClick={() => removeMember(member.id)}
                          disabled={removingId === member.id}
                          className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-50"
                        >
                          {removingId === member.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
