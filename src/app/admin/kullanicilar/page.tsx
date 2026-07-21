import { prisma } from "@/lib/prisma";
import { T, type AdminKey } from "@/components/admin/t";
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
      emailVerified: true, createdAt: true,
      _count: { select: { ownedBrands: true, memberships: true } },
    },
  });

  const roleCounts = users.reduce((acc, u) => {
    acc[u.globalRole] = (acc[u.globalRole] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold"><T k="users" /></h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]"><T k="usersSub" n={users.length} /></p>
      </div>

      {/* Rol dağılımı */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {(["SUPER_ADMIN", "ADMIN", "CUSTOMER", "STAFF"] as GlobalRole[]).map((role) => (
          <div key={role} className="glass rounded-2xl p-4">
            <p className="text-xl font-bold">{roleCounts[role] ?? 0}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role]}`}>
              <T k={ROLE_KEYS[role]} />
            </span>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {(["user", "role", "brand", "membership", "verified", "status", "createdAt"] as AdminKey[]).map((h) => (
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
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[u.globalRole]}`}>
                    <T k={ROLE_KEYS[u.globalRole]} />
                  </span>
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
