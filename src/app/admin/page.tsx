import { prisma } from "@/lib/prisma";
import { T, type AdminKey } from "@/components/admin/t";
import { Users, Building2, MessageSquare, Star, Brain, TrendingUp } from "lucide-react";
import { MailSender } from "@/components/admin/mail-sender";

export default async function AdminPage() {
  const [
    userCount, brandCount, activeSubCount, totalReviews,
    totalConversations, aiUsage, recentUsers, recentBrands,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.brand.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.review.count(),
    prisma.chatbotConversation.count(),
    prisma.aiUsage.aggregate({ _sum: { tokensIn: true, tokensOut: true, costCents: true } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, email: true, globalRole: true, createdAt: true } }),
    prisma.brand.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, slug: true, createdAt: true, owner: { select: { name: true, email: true } }, subscriptions: { take: 1, orderBy: { createdAt: "desc" }, select: { status: true } } } }),
  ]);

  const totalCost = ((aiUsage._sum.costCents ?? 0) / 100).toFixed(2);
  const totalTokens = ((aiUsage._sum.tokensIn ?? 0) + (aiUsage._sum.tokensOut ?? 0)).toLocaleString("tr-TR");

  const STATS = [
    { label: "user" as AdminKey, value: userCount, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "brand" as AdminKey, value: brandCount, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "activeSub" as AdminKey, value: activeSubCount, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "review" as AdminKey, value: totalReviews, icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "chatbotConv" as AdminKey, value: totalConversations, icon: MessageSquare, color: "text-teal-400", bg: "bg-teal-500/10" },
    { label: "aiCost" as AdminKey, value: totalCost, icon: Brain, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  const ROLE_KEYS: Record<string, AdminKey> = { SUPER_ADMIN: "superAdmin", ADMIN: "admin", CUSTOMER: "customer", STAFF: "staff" };
  const ROLE_COLORS: Record<string, string> = { SUPER_ADMIN: "text-purple-400 bg-purple-500/10", ADMIN: "text-blue-400 bg-blue-500/10", CUSTOMER: "text-green-400 bg-green-500/10", STAFF: "text-yellow-400 bg-yellow-500/10" };
  const SUB_COLORS: Record<string, string> = { ACTIVE: "text-green-400 bg-green-500/10", TRIALING: "text-blue-400 bg-blue-500/10", PAST_DUE: "text-orange-400 bg-orange-500/10", CANCELED: "text-red-400 bg-red-500/10", EXPIRED: "text-gray-400 bg-gray-500/10" };
  const SUB_KEYS: Record<string, AdminKey> = { ACTIVE: "active", TRIALING: "trial", PAST_DUE: "pastDue", CANCELED: "canceled", EXPIRED: "expired" };

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold"><T k="overview" /></h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]"><T k="overviewSub" /></p>
      </div>

      {/* İstatistik kartları */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]"><T k={s.label} /></p>
          </div>
        ))}
      </div>

      {/* AI özet */}
      <div className="glass mb-8 rounded-2xl p-5">
        <p className="mb-4 text-sm font-semibold"><T k="aiSummary" /></p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Toplam Token</p>
            <p className="mt-1 text-xl font-bold">{totalTokens}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Toplam Maliyet</p>
            <p className="mt-1 text-xl font-bold">₺{totalCost}</p>
          </div>
          <div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]"><T k="inOutToken" /></p>
            <p className="mt-1 text-xl font-bold">
              {(aiUsage._sum.tokensIn ?? 0).toLocaleString("tr-TR")} / {(aiUsage._sum.tokensOut ?? 0).toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Son kayıt olan kullanıcılar */}
        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3">
            <p className="text-sm font-semibold"><T k="recentUsers" /></p>
            <a href="/admin/kullanicilar" className="text-xs text-[hsl(var(--primary))] hover:underline"><T k="seeAll" /></a>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-xs font-bold text-[hsl(var(--primary))]">
                  {(u.name ?? u.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{u.name ?? "—"}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{u.email}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[u.globalRole]}`}>
                  <T k={ROLE_KEYS[u.globalRole] ?? "customer"} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Son oluşturulan markalar */}
        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-3">
            <p className="text-sm font-semibold"><T k="recentBrands" /></p>
            <a href="/admin/markalar" className="text-xs text-[hsl(var(--primary))] hover:underline"><T k="seeAll" /></a>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {recentBrands.map((b) => {
              const sub = b.subscriptions[0];
              return (
                <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-xs font-bold text-[hsl(var(--primary))]">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{b.owner.name ?? b.owner.email}</p>
                  </div>
                  {sub && (
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SUB_COLORS[sub.status]}`}>
                      <T k={SUB_KEYS[sub.status] ?? "active"} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mail gönderim paneli */}
      <div className="mt-6 max-w-lg">
        <MailSender />
      </div>
    </div>
  );
}
