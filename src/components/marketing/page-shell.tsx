"use client";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { useLang, LanguageSwitcher } from "@/components/language-provider";

const SHELL_L = {
  tr: {
    features: "Özellikler", pricing: "Fiyatlar", faq: "SSS", contact: "İletişim",
    login: "Giriş Yap", signup: "Ücretsiz Başla",
    desc: "İşletmeniz için yapay zeka destekli dijital ajans: website, chatbot, içerik, menü ve müşteri yönetimi tek platformda.",
    rights: "Tüm hakları saklıdır.",
    legal: "Yasal", updated: "Son güncelleme:",
    cols: {
      product: "Ürün", corporate: "Kurumsal", legalCol: "Yasal",
      about: "Hakkımızda", terms: "Kullanım Şartları", privacy: "Gizlilik Politikası",
      kvkk: "KVKK Aydınlatma Metni", cookies: "Çerez Politikası", refund: "İade & İptal Politikası",
    },
  },
  en: {
    features: "Features", pricing: "Pricing", faq: "FAQ", contact: "Contact",
    login: "Sign In", signup: "Start Free",
    desc: "AI-powered digital agency for your business: website, chatbot, content, menu and customer management in one platform.",
    rights: "All rights reserved.",
    legal: "Legal", updated: "Last updated:",
    cols: {
      product: "Product", corporate: "Company", legalCol: "Legal",
      about: "About", terms: "Terms of Service", privacy: "Privacy Policy",
      kvkk: "KVKK Notice", cookies: "Cookie Policy", refund: "Refund & Cancellation Policy",
    },
  },
};

/** Ortak pazarlama sayfası kabuğu: üst menü + zengin footer. (Koyu tema) */
export function PageShell({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const sL = SHELL_L[lang];
  const FOOTER_COLS = [
    {
      title: sL.cols.product,
      links: [
        { label: sL.features, href: "/#ozellikler" },
        { label: sL.pricing, href: "/fiyatlar" },
      ],
    },
    {
      title: sL.cols.corporate,
      links: [
        { label: sL.cols.about, href: "/hakkimizda" },
        { label: sL.contact, href: "/iletisim" },
        { label: sL.faq, href: "/sss" },
      ],
    },
    {
      title: sL.cols.legalCol,
      links: [
        { label: sL.cols.terms, href: "/kullanim-sartlari" },
        { label: sL.cols.privacy, href: "/gizlilik" },
        { label: sL.cols.kvkk, href: "/kvkk" },
        { label: sL.cols.cookies, href: "/cerez-politikasi" },
        { label: sL.cols.refund, href: "/iade-politikasi" },
      ],
    },
  ];
  return (
    <div className="min-h-screen bg-[#07070e] text-slate-300 selection:bg-violet-500/40">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#07070e]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-bold text-white">Novelya</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex">
            <Link href="/#ozellikler" className="transition hover:text-white">{sL.features}</Link>
            <Link href="/fiyatlar" className="transition hover:text-white">{sL.pricing}</Link>
            <Link href="/sss" className="transition hover:text-white">{sL.faq}</Link>
            <Link href="/iletisim" className="transition hover:text-white">{sL.contact}</Link>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/giris" className="hidden text-sm font-semibold text-slate-300 transition hover:text-white sm:block">
              {sL.login}
            </Link>
            <Link
              href="/kayit"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
            >
              {sL.signup}
            </Link>
          </div>
        </div>
      </header>

      {/* İçerik */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#05050a]">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Marka */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <LogoMark size={32} />
                <span className="font-bold text-white">Novelya</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
                {sL.desc}
              </p>
            </div>

            {/* Link kolonları */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-bold text-white">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-slate-500 transition hover:text-violet-400">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-white/[0.06] pt-6 text-sm text-slate-600">
            <p>© {new Date().getFullYear()} Novelya. {sL.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Yasal metinler için tutarlı tipografi sarmalayıcısı. (Koyu tema) */
export function LegalArticle({
  title, updated, children,
}: { title: string; updated: string; children: React.ReactNode }) {
  const { lang } = useLang();
  const sL = SHELL_L[lang];
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 border-b border-white/[0.08] pb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-400">{sL.legal}</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-slate-500">{sL.updated} {updated}</p>
      </div>
      <article
        className="space-y-5 text-[15px] leading-relaxed text-slate-400
          [&_a]:font-medium [&_a]:text-violet-400 [&_a:hover]:underline
          [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white
          [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white
          [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
          [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5
          [&_strong]:font-semibold [&_strong]:text-slate-200"
      >
        {children}
      </article>
    </div>
  );
}
