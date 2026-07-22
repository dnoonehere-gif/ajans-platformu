import { prisma } from "@/lib/prisma";
import { T, type AdminKey } from "@/components/admin/t";

const SUB_COLORS: Record<string, string> = { ACTIVE: "text-green-400 bg-green-500/10", TRIALING: "text-blue-400 bg-blue-500/10", PAST_DUE: "text-orange-400 bg-orange-500/10", CANCELED: "text-red-400 bg-red-500/10", EXPIRED: "text-gray-400 bg-gray-500/10" };
const SUB_KEYS: Record<string, AdminKey> = { ACTIVE: "active", TRIALING: "trial", PAST_DUE: "pastDue", CANCELED: "canceled", EXPIRED: "expired" };

export default async function MarkalarPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, slug: true, isActive: true, createdAt: true,
      owner: { select: { name: true, email: true } },
      _count: { select: { reviews: true, members: true, contentItems: true } },
      subscriptions: { take: 1, orderBy: { createdAt: "desc" }, select: { status: true, plan: { select: { name: true } } } },
      chatbot: { select: { isActive: true } },
      website: { select: { isPublished: true } },
    },
  });

  const subCounts = brands.reduce((acc, b) => {
    const s = b.subscriptions[0]?.status ?? "YOK";
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Markalar</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Toplam {brands.length} marka</p>
      </div>

      {/* Abonelik özeti */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Object.entries(SUB_KEYS).map(([key, tKey]) => (
          <div key={key} className="glass rounded-2xl p-4">
            <p className="text-xl font-bold">{subCounts[key] ?? 0}</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${SUB_COLORS[key]}`}>
              <T k={tKey} />
            </span>
          </div>
        ))}
      </div>

      {/* Tablo */}
      <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {(["brand", "owner", "subscription", "review", "member", "content", "website", "chatbot", "createdAt"] as AdminKey[]).map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><T k={h} /></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {brands.map((b) => {
              const sub = b.subscriptions[0];
              return (
                <tr key={b.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">/{b.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p>{b.owner.name ?? "—"}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{b.owner.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {sub ? (
                      <div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SUB_COLORS[sub.status]}`}>
                          <T k={SUB_KEYS[sub.status] ?? "active"} />
                        </span>
                        {sub.plan && <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{sub.plan.name}</p>}
                      </div>
                    ) : <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{b._count.reviews}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{b._count.members}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{b._count.contentItems}</td>
                  <td className="px-4 py-3">
                    {b.website?.isPublished
                      ? <span className="text-xs text-green-400">✓ <T k="published" /></span>
                      : b.website ? <span className="text-xs text-orange-400">Taslak</span>
                      : <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {b.chatbot?.isActive
                      ? <span className="text-xs text-green-400">✓ <T k="active" /></span>
                      : b.chatbot ? <span className="text-xs text-orange-400"><T k="passive" /></span>
                      : <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                    {new Date(b.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
