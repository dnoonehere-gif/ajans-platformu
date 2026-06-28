import { NextRequest } from "next/server";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

// Server-Sent Events — unread sayısını 30 saniyede bir gönder
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new Response("Yetkisiz", { status: 401 });
  const userId = (session.user as { id: string }).id;

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const tick = async () => {
        if (closed) return;
        try {
          const count = await prisma.notification.count({
            where: { userId, status: "UNREAD", channel: "IN_APP" },
          });
          send({ unreadCount: count });
        } catch {
          closed = true;
        }
      };

      await tick();
      const interval = setInterval(tick, 30_000);

      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
