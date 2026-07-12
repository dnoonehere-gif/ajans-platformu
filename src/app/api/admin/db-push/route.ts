import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const user = session.user as { id: string; role?: string };
  if (user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  try {
    const { stdout, stderr } = await execAsync("npx prisma db push --skip-generate --accept-data-loss", {
      timeout: 60000,
    });
    return NextResponse.json({ success: true, stdout, stderr });
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return NextResponse.json({ error: "Komut başarısız", stdout: err.stdout, stderr: err.stderr, message: err.message }, { status: 500 });
  }
}
