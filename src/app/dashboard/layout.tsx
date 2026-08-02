import { auth } from "@/server/auth/auth";
import { prisma } from "@/lib/prisma";

import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { BrandProvider } from "@/components/dashboard/brand-provider";
import { WhiteLabelProvider } from "@/components/dashboard/white-label-provider";
import { WhiteLabelLogo } from "@/components/dashboard/white-label-logo";
import { BrandSwitcher } from "@/components/dashboard/brand-switcher";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import { LanguageSwitcher } from "@/components/language-provider";
import { Breadcrumb } from "@/components/dashboard/breadcrumb";
import { LogoutButton, UserName } from "@/components/dashboard/theme-switcher";
import { NavClient } from "@/components/dashboard/nav-client";
import { SubscriptionBanner } from "@/components/dashboard/subscription-banner";
import { EmailVerifyBanner } from "@/components/dashboard/email-verify-banner";
import { MobileSidebarToggle } from "@/components/dashboard/mobile-sidebar";
import { AmbientBackground } from "@/components/dashboard/ambient-background";
import { DashboardColorTheme } from "@/components/theme-provider";
import { signOut } from "@/server/auth/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  // E-posta doğrulama: sert duvar yerine 1 günlük süre. Kayıttan sonra kullanıcı
  // 24 saat dashboard'u kullanabilir (üstte uyarı bandıyla); süre dolar ve hâlâ
  // doğrulanmamışsa hesap askıya alınır (erişim /dogrulama-bekleniyor'a döner).
  // Durum DB'den taze okunur ki kullanıcı doğrular doğrulamaz bant/askı kalksın.
  const userId = (session.user as { id?: string }).id;
  const GRACE_MS = 24 * 60 * 60 * 1000;
  let emailWarnHours: number | null = null;
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true, createdAt: true },
    });
    if (dbUser && !dbUser.emailVerified) {
      const elapsed = Date.now() - dbUser.createdAt.getTime();
      if (elapsed >= GRACE_MS) redirect("/dogrulama-bekleniyor"); // süre doldu → askıda
      emailWarnHours = Math.max(1, Math.ceil((GRACE_MS - elapsed) / (60 * 60 * 1000)));
    }
  }

  const user = session.user as { name?: string | null; email?: string | null; role?: string };
  const initials = (user.name ?? user.email ?? "K").slice(0, 2).toUpperCase();

  return (
    <BrandProvider>
      <WhiteLabelProvider>
      <DashboardColorTheme />
      <div className="flex min-h-screen bg-[hsl(var(--background))]">
        <AmbientBackground />
        {/* Sidebar — masaüstü */}
        <aside
          className="group fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col overflow-hidden border-r border-[hsl(var(--border)/0.5)] bg-[hsl(var(--card))] transition-[width] duration-300 ease-out hover:w-64 hover:shadow-[0_0_60px_-12px_hsl(var(--foreground)/0.25)] lg:flex">

          {/* Logo */}
          <div className="flex h-16 w-[232px] shrink-0 items-center overflow-hidden border-b border-[hsl(var(--border)/0.5)] px-[21px] [&_p]:opacity-0 [&_p]:transition-opacity group-hover:w-auto group-hover:px-5 group-hover:[&_p]:opacity-100">
            <WhiteLabelLogo />
          </div>

          {/* Marka seçici */}
          <div className="w-[232px] shrink-0 overflow-hidden border-b border-[hsl(var(--border))] p-2 group-hover:w-auto group-hover:p-3">
            <BrandSwitcher />
          </div>

          {/* Nav */}
          <NavClient rail />

          {/* Tema seçici Ayarlar > Görünüm sekmesine taşındı */}

          {/* Kullanıcı */}
          <div className="border-t border-[hsl(var(--border))] p-3">
            <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--accent)/0.6)] px-2 py-2.5 group-hover:px-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.2)] text-xs font-bold text-[hsl(var(--primary))]">
                {initials}
              </div>
              <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <p className="truncate text-xs font-semibold"><UserName name={user.name} /></p>
                <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">{user.email}</p>
              </div>
              <form className="shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" action={async () => { "use server"; await signOut({ redirectTo: `${process.env.NEXTAUTH_URL ?? ""}/giris` }); }}>
                <LogoutButton />
              </form>
            </div>
          </div>
        </aside>

        {/* İçerik */}
        <main className="relative z-10 flex-1 min-h-screen overflow-auto lg:ml-[76px]">
          {/* Topbar */}
          <div className="sticky top-0 z-30 flex h-16 items-center border-b border-[hsl(var(--border)/0.5)] bg-[hsl(var(--background)/0.75)] px-4 backdrop-blur-xl gap-2">
            {/* Mobil hamburger + slide-in sidebar */}
            <MobileSidebarToggle>
              <div className="border-b border-[hsl(var(--border))] p-3">
                <BrandSwitcher />
              </div>
              <NavClient />

              {/* Tema seçici Ayarlar > Görünüm sekmesine taşındı */}

              {/* Kullanıcı */}
              <div className="border-t border-[hsl(var(--border))] p-3">
                <div className="flex items-center gap-3 rounded-2xl bg-[hsl(var(--accent)/0.6)] px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.2)] text-xs font-bold text-[hsl(var(--primary))]">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-semibold"><UserName name={user.name} /></p>
                    <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">{user.email}</p>
                  </div>
                  <form action={async () => { "use server"; await signOut({ redirectTo: `${process.env.NEXTAUTH_URL ?? ""}/giris` }); }}>
                    <LogoutButton />
                  </form>
                </div>
              </div>
            </MobileSidebarToggle>
            <Breadcrumb />
            {/* Sağ aksiyonlar — referans tasarımdaki yüzen kapsül grubu */}
            <div className="ml-auto flex items-center gap-1 rounded-full border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--card))] px-1.5 py-1 shadow-sm">
              <LanguageSwitcher />
              <NotificationBell />
            </div>
          </div>
          {emailWarnHours !== null && <EmailVerifyBanner hoursLeft={emailWarnHours} />}
          <SubscriptionBanner />
          {children}
        </main>
      </div>
    </WhiteLabelProvider>
    </BrandProvider>
  );
}
