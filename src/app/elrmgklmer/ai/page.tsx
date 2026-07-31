import { prisma } from "@/lib/prisma";
import { T, type AdminKey } from "@/components/admin/t";

const FEATURE_LABELS: Record<string, string> = {
  content: "contentGen",
  chatbot: "Chatbot",
  review_analysis: "Yorum Analizi",
  dashboard_summary: "dashboardSummary",
  website: "Website Builder",
};

export default async function AiPage() {
  const [byFeature, byModel, byDay, total] = await Promise.all([
    prisma.aiUsage.groupBy({
      by: ["feature"],
      _sum: { tokensIn: true, tokensOut: true, costCents: true },
      _count: true,
      orderBy: { _sum: { costCents: "desc" } },
    }),
    prisma.aiUsage.groupBy({
      by: ["model"],
      _sum: { tokensIn: true, tokensOut: true, costCents: true },
      _count: true,
    }),
    prisma.aiUsage.groupBy({
      by: ["createdAt"],
      _sum: { costCents: true, tokensIn: true, tokensOut: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.aiUsage.aggregate({ _sum: { tokensIn: true, tokensOut: true, costCents: true }, _count: true }),
  ]);

  const totalTokens = (total._sum.tokensIn ?? 0) + (total._sum.tokensOut ?? 0);

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold"><T k="aiUsage" /></h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]"><T k="aiUsageSub" /></p>
      </div>

      {/* Toplam */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "totalRequests", value: total._count.toLocaleString("tr-TR") },
          { label: "totalToken", value: totalTokens.toLocaleString("tr-TR") },
          { label: "inputToken", value: (total._sum.tokensIn ?? 0).toLocaleString("tr-TR") },
          { label: "totalCost", value: `₺${((total._sum.costCents ?? 0) / 100).toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]"><T k={s.label as AdminKey} /></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Özelliğe göre */}
        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <div className="border-b border-[hsl(var(--border))] px-5 py-3">
            <p className="font-semibold text-sm"><T k="byFeature" /></p>
          </div>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {(["feature", "requests", "token", "cost"] as AdminKey[]).map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><T k={h} /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {byFeature.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]"><T k="noData" /></td></tr>
              ) : byFeature.map((f) => (
                <tr key={f.feature} className="hover:bg-[hsl(var(--accent)/0.5)]">
                  <td className="px-4 py-3 font-medium">{FEATURE_LABELS[f.feature] ?? f.feature}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{f._count}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {((f._sum.tokensIn ?? 0) + (f._sum.tokensOut ?? 0)).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-orange-400">
                    ₺{((f._sum.costCents ?? 0) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modele göre */}
        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <div className="border-b border-[hsl(var(--border))] px-5 py-3">
            <p className="font-semibold text-sm"><T k="byModel" /></p>
          </div>
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                {(["model", "requests", "token", "cost"] as AdminKey[]).map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><T k={h} /></th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {byModel.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]"><T k="noData" /></td></tr>
              ) : byModel.map((m) => (
                <tr key={m.model} className="hover:bg-[hsl(var(--accent)/0.5)]">
                  <td className="px-4 py-3 font-mono text-xs">{m.model}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{m._count}</td>
                  <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">
                    {((m._sum.tokensIn ?? 0) + (m._sum.tokensOut ?? 0)).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-orange-400">
                    ₺{((m._sum.costCents ?? 0) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
