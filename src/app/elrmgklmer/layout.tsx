import { auth } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "SUPER_ADMIN" && role !== "ADMIN") redirect("/dashboard");

  return <AdminShell>{children}</AdminShell>;
}
