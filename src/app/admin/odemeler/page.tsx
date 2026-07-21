import { prisma } from "@/lib/prisma";
import { T, type AdminKey } from "@/components/admin/t";

const STATUS_COLORS: Record<string, string> = { PENDING: "text-yellow-400 bg-yellow-500/10", PAID: "text-green-400 bg-green-500/10", FAILED: "text-red-400 bg-red-500/10", REFUNDED: "text-blue-400 bg-blue-500/10" };
const STATUS_KEYS: Record<string, AdminKey> = { PENDING: "pending", PAID: "paid", FAILED: "failed", REFUNDED: "refunded" };

export default async function OdemelerPage() {
  const [invoices, totals] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true, amountCents: true, currency: true, status: true, provider: true, paidAt: true, createdAt: true,
        subscription: { select: { brand: { select: { name: true } }, plan: { select: { name: true } } } },
      },
    }),
    prisma.invoice.groupBy({
      by: ["status"],
      _sum: { amountCents: true },
      _count: true,
    }),
  ]);

  const totalPaid = totals.find((t) => t.status === "PAID")?._sum.amountCents ?? 0;
  const totalPending = totals.find((t) => t.status === "PENDING")?._sum.amountCents ?? 0;
  const totalFailed = totals.find((t) => t.status === "FAILED")?._sum.amountCents ?? 0;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold"><T k="payments" /></h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]"><T k="paymentsSub" /></p>
      </div>

      {/* Özet */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Toplam Tahsilat</p>
          <p className="mt-1 text-2xl font-bold text-green-400">₺{(totalPaid / 100).toLocaleString("tr-TR")}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Bekleyen</p>
          <p className="mt-1 text-2xl font-bold text-yellow-400">₺{(totalPending / 100).toLocaleString("tr-TR")}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-xs text-[hsl(var(--muted-foreground))]"><T k="failed" /></p>
          <p className="mt-1 text-2xl font-bold text-red-400">₺{(totalFailed / 100).toLocaleString("tr-TR")}</p>
        </div>
      </div>

      {/* Tablo */}
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {(["brand", "planName", "amount", "provider", "status", "paidAt", "created"] as AdminKey[]).map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><T k={h} /></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {invoices.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[hsl(var(--muted-foreground))]"><T k="noPayment" /></td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                <td className="px-4 py-3 font-medium">{inv.subscription.brand.name}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{inv.subscription.plan.name}</td>
                <td className="px-4 py-3 font-semibold">₺{(inv.amountCents / 100).toLocaleString("tr-TR")}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{inv.provider}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status]}`}>
                    <T k={STATUS_KEYS[inv.status] ?? "pending"} />
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                  {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString("tr-TR") : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                  {new Date(inv.createdAt).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
