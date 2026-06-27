import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { GlobalRole } from "@prisma/client";

const GLOBAL_ROLE_COLORS: Record<GlobalRole, string> = {
  SUPER_ADMIN: "bg-purple-500/15 text-purple-400",
  ADMIN: "bg-blue-500/15 text-blue-400",
  CUSTOMER: "bg-green-500/15 text-green-400",
  STAFF: "bg-yellow-500/15 text-yellow-400",
};

const GLOBAL_ROLE_LABELS: Record<GlobalRole, string> = {
  SUPER_ADMIN: "Süper Admin",
  ADMIN: "Admin",
  CUSTOMER: "Müşteri",
  STAFF: "Personel",
};

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/dashboard");

  const [users, brands, aiUsage, totalReviews, totalConversations] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, globalRole: true, isActive: true, createdAt: true, _count: { select: { ownedBrands: true } } },
    }),
    prisma.brand.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, name: true, slug: true, isActive: true, createdAt: true,
        owner: { select: { name: true, email: true } },
        _count: { select: { reviews: true, members: true } },
        subscriptions: { select: { status: true }, take: 1, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.aiUsage.aggregate({ _sum: { tokensIn: true, tokensOut: true, costCents: true } }),
    prisma.review.count(),
    prisma.chatbotConversation.count(),
  ]);

  const totalTokens = (aiUsage._sum.tokensIn ?? 0) + (aiUsage._sum.tokensOut ?? 0);
  const totalCost = (aiUsage._sum.costCents ?? 0) / 100;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Platform Admin Paneli</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Tüm kullanıcılar, markalar ve platform istatistikleri</p>
      </div>

      {/* Platform istatistikleri */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Toplam Kullanıcı", value: users.length },
          { label: "Toplam Marka", value: brands.length },
          { label: "Toplam Yorum", value: totalReviews },
          { label: "Chatbot Konuşma", value: totalConversations },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI kullanım istatistikleri */}
      <div className="glass mb-6 grid grid-cols-3 gap-4 rounded-2xl p-5">
        <div>
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Toplam Token</p>
          <p className="text-xl font-bold">{totalTokens.toLocaleString("tr-TR")}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">Toplam Maliyet</p>
          <p className="text-xl font-bold">₺{totalCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1">AI Kullanım Kaydı</p>
          <p className="text-xl font-bold">{(await prisma.aiUsage.count()).toLocaleString("tr-TR")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kullanıcılar */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="border-b border-[hsl(var(--border))] px-5 py-3">
            <p className="text-sm font-semibold">Kullanıcılar ({users.length})</p>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-[hsl(var(--border))]">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] text-xs font-bold text-[hsl(var(--primary))]">
                  {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name ?? "—"}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${GLOBAL_ROLE_COLORS[user.globalRole]}`}>
                    {GLOBAL_ROLE_LABELS[user.globalRole]}
                  </span>
                  {!user.isActive && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">Pasif</span>
                  )}
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">{user._count.ownedBrands} marka</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Markalar */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="border-b border-[hsl(var(--border))] px-5 py-3">
            <p className="text-sm font-semibold">Markalar ({brands.length})</p>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-[hsl(var(--border))]">
            {brands.map((brand) => {
              const subStatus = brand.subscriptions[0]?.status;
              return (
                <div key={brand.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-medium">{brand.name}</p>
                    <div className="flex items-center gap-1.5">
                      {subStatus && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          subStatus === "ACTIVE" ? "bg-green-500/15 text-green-400" :
                          subStatus === "TRIALING" ? "bg-blue-500/15 text-blue-400" :
                          "bg-red-500/15 text-red-400"
                        }`}>
                          {subStatus === "ACTIVE" ? "Aktif" : subStatus === "TRIALING" ? "Deneme" :
                           subStatus === "PAST_DUE" ? "Gecikmiş" : subStatus === "CANCELED" ? "İptal" : "Süresi Dolmuş"}
                        </span>
                      )}
                      {!brand.isActive && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">Pasif</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {brand.owner.name ?? brand.owner.email} · {brand._count.reviews} yorum · {brand._count.members} üye
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5">/{brand.slug}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
