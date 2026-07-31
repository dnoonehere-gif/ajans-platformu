import { prisma } from "@/lib/prisma";
import { T, type AdminKey } from "@/components/admin/t";
import { AssignPlan } from "@/components/admin/assign-plan";
import { TrialInvite } from "@/components/admin/trial-invite";
import type { GlobalRole } from "@prisma/client";

const ROLE_KEYS: Record<GlobalRole, AdminKey> = { SUPER_ADMIN: "superAdmin", ADMIN: "admin", CUSTOMER: "customer", STAFF: "staff" };
const ROLE_COLORS: Record<GlobalRole, string> = {
  SUPER_ADMIN: "text-purple-400 bg-purple-500/10",
  ADMIN: "text-blue-400 bg-blue-500/10",
  CUSTOMER: "text-green-400 bg-green-500/10",
  STAFF: "text-yellow-400 bg-yellow-500/10",
};

export default async function KullanicilarPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, globalRole: true, isActive: true,
      emailVerified: true, createdAt: true, signupIp: true,
      _count: { select: { ownedBrands: true, memberships: true } },
      ownedBrands: {
        select: {
          subscriptions: {
            where: { status: { in: ["ACTIVE", "TRIALING"] } },
            select: { status: true, endsAt: true, trialEndsAt: true, plan: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const roleCounts = users.reduce((acc, u) => {
    acc[u.globalRole] = (acc[u.globalRole] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Suistimal sinyali: aynı IP'yi paylaşan hesap sayısı
  const ipCounts = users.reduce((acc, u) => {
    if (u.signupIp) acc[u.signupIp] = (acc[u.signupIp] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Aktif deneme sayısı
  const activeTrials = users.filter((u) =>
    u.ownedBrands.flatMap((b) => b.subscriptions).some((s) => s.status === "TRIALING")
  ).length;

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold"><T k="users" /></h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]"><T k="usersSub" n={users.length} /></p>
      </div>

      {/* Rol dağılımı + aktif deneme */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {(["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] as GlobalRole[]).map((role) => (
          <div key={role} className="glass rounded-2xl p-4">
            <p className="text-xl font-bold">{roleCounts[role] ?? 0}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}>
              <T k={ROLE_KEYS[role]} />
            </span>
          </div>
        ))}
        <div className="glass rounded-2xl p-4">
          <p className="text-xl font-bold">{activeTrials}</p>
          <span className="mt-1 inline-block rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
            <T k="trialsActive" />
          </span>
        </div>
      </div>

      {/* Plan tanımlama + deneme daveti */}
      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <AssignPlan />
        <TrialInvite />
      </div>

      {/* Tablo */}
      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {(["user", "role", "plan", "brand", "membership", "verified", "status", "createdAt"] as AdminKey[]).map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><T k={h} /></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-xs font-bold text-[hsl(var(--primary))]">
                      {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{u.name ?? "—"}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{u.email}</p>
                      {u.signupIp && ipCounts[u.signupIp] > 1 && (
                        <span className="mt-0.5 inline-block rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
                          ⚠ <T k="sameIp" n={ipCounts[u.signupIp]} />
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[u.globalRole]}`}>
                    <T k={ROLE_KEYS[u.globalRole]} />
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const sub = u.ownedBrands.flatMap((b) => b.subscriptions)[0];
                    if (!sub) return <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>;
                    if (sub.status === "TRIALING") {
                      const end = sub.trialEndsAt ?? sub.endsAt;
                      const days = end ? Math.max(0, Math.ceil((new Date(end).getTime() - Date.now()) / 86400000)) : 0;
                      return (
                        <span className="inline-flex flex-col gap-0.5">
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                            {sub.plan.name} · <T k="trial" />
                          </span>
                          <span className="text-[10px] text-[hsl(var(--muted-foreground))]"><T k="daysLeft" n={days} /></span>
                        </span>
                      );
                    }
                    const expired = sub.endsAt && new Date(sub.endsAt) < new Date();
                    return (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${expired ? "bg-orange-500/10 text-orange-400" : "bg-green-500/10 text-green-400"}`}>
                        {sub.plan.name}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{u._count.ownedBrands}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{u._count.memberships}</td>
                <td className="px-4 py-3">
                  {u.emailVerified
                    ? <span className="text-xs text-green-400">✓ <T k="verified" /></span>
                    : <span className="text-xs text-orange-400"><T k="pending" /></span>}
                </td>
                <td className="px-4 py-3">
                  {u.isActive
                    ? <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400"><T k="active" /></span>
                    : <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400"><T k="passive" /></span>}
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                  {new Date(u.createdAt).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
