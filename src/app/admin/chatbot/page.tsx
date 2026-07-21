import { prisma } from "@/lib/prisma";
import { T, type AdminKey } from "@/components/admin/t";

export default async function ChatbotAdminPage() {
  const [chatbots, msgStats, convStats] = await Promise.all([
    prisma.chatbot.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, isActive: true, createdAt: true,
        brand: { select: { name: true, slug: true } },
        _count: { select: { conversations: true, knowledgeBase: true } },
      },
    }),
    prisma.chatbotMessage.count(),
    prisma.chatbotConversation.groupBy({
      by: ["chatbotId"],
      _count: true,
      orderBy: { _count: { chatbotId: "desc" } },
      take: 10,
    }),
  ]);

  const totalConversations = chatbots.reduce((a, c) => a + c._count.conversations, 0);
  const activeCount = chatbots.filter((c) => c.isActive).length;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chatbot</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]"><T k="allBrandChatbots" /></p>
      </div>

      {/* Özet */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: "Toplam Chatbot", value: chatbots.length },
          { label: "Aktif Chatbot", value: activeCount },
          { label: "totalConv" as AdminKey, value: totalConversations.toLocaleString("tr-TR") },
          { label: "Toplam Mesaj", value: msgStats.toLocaleString("tr-TR") },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chatbot listesi */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="border-b border-[hsl(var(--border))] px-5 py-3">
          <p className="font-semibold text-sm">Chatbot Listesi</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              {(["brand", "chatbotName", "knowledgeBase", "conversation", "status", "created"] as AdminKey[]).map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><T k={h} /></th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {chatbots.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-[hsl(var(--muted-foreground))]"><T k="noChatbot" /></td></tr>
            ) : chatbots.map((c) => (
              <tr key={c.id} className="hover:bg-[hsl(var(--accent)/0.5)]">
                <td className="px-4 py-3">
                  <p className="font-medium">{c.brand.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">/{c.brand.slug}</p>
                </td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{c._count.knowledgeBase} <T k="records" /></td>
                <td className="px-4 py-3 text-[hsl(var(--muted-foreground))]">{c._count.conversations}</td>
                <td className="px-4 py-3">
                  {c.isActive
                    ? <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">Aktif</span>
                    : <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">Pasif</span>}
                </td>
                <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                  {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
