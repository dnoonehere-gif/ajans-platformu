"use client";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { useLang } from "@/components/language-provider";
import { PublicControls } from "@/components/marketing/public-controls";
import { ArrowRight } from "lucide-react";

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

/**
 * Ortak pazarlama sayfası kabuğu. Anasayfayla aynı dil: açık kırık-beyaz zemin,
 * içerik yuvarlak beyaz kartlar hâlinde, üstte yüzen kapsül menü.
 */
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

  const navLinks = (
    <>
      <Link href="/#ozellikler" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--mk-ink-soft)] transition hover:bg-[var(--mk-chip)] hover:text-[var(--mk-ink)]">{sL.features}</Link>
      <Link href="/fiyatlar" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--mk-ink-soft)] transition hover:bg-[var(--mk-chip)] hover:text-[var(--mk-ink)]">{sL.pricing}</Link>
      <Link href="/sss" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--mk-ink-soft)] transition hover:bg-[var(--mk-chip)] hover:text-[var(--mk-ink)]">{sL.faq}</Link>
      <Link href="/iletisim" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--mk-ink-soft)] transition hover:bg-[var(--mk-chip)] hover:text-[var(--mk-ink)]">{sL.contact}</Link>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--mk-bg)] text-[var(--mk-ink)] selection:bg-violet-300/60">
      <div className="mx-auto max-w-[1400px] px-3 pb-3 sm:px-4 sm:pb-4">

        {/* İçerik kartı — üstte yapışkan kapsül menü */}
        <div className="overflow-hidden rounded-[28px] bg-[var(--mk-surface)] shadow-[0_30px_80px_-40px_rgba(20,20,40,0.35)] sm:rounded-[36px]">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-[var(--mk-line)] bg-[var(--mk-surface)]/90 px-4 py-4 backdrop-blur-xl sm:px-7">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <LogoMark size={30} />
              <span className="text-[15px] font-bold tracking-tight">Novelya</span>
            </Link>

            <nav className="hidden items-center rounded-full bg-[var(--mk-chip)] p-1 md:flex">{navLinks}</nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/giris" className="hidden text-sm font-medium text-[var(--mk-ink-soft)] transition hover:text-[var(--mk-ink)] sm:block">
                {sL.login}
              </Link>
              <Link
                href="/kayit"
                className="nv-btn nv-btn-ghost group inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[var(--mk-btn)] px-5 py-2.5 text-sm font-semibold text-[var(--mk-btn-ink)] transition hover:opacity-90"
              >
                {sL.signup}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </header>

          <main>{children}</main>
        </div>

        {/* Footer — ayrı beyaz kart */}
        <footer className="mt-3 rounded-[28px] bg-[var(--mk-surface)] px-6 py-12 sm:mt-4 sm:rounded-[36px] sm:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark size={30} />
                <span className="text-[15px] font-bold tracking-tight">Novelya</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--mk-ink-soft)]">{sL.desc}</p>
            </div>

            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--mk-ink-mute)]">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-[var(--mk-ink-soft)] transition hover:text-violet-600">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="my-8 border-t border-dashed border-[var(--mk-line)]" />
          <div className="mb-6 flex justify-center"><PublicControls /></div>
          <p className="text-center text-xs text-[var(--mk-ink-mute)]">
            © {new Date().getFullYear()} Novelya. {sL.rights}
          </p>
        </footer>
      </div>
    </div>
  );
}

/** Yasal metinler için tutarlı tipografi sarmalayıcısı. (Açık tema) */
export function LegalArticle({
  title, updated, children,
}: { title: string; updated: string; children: React.ReactNode }) {
  const { lang } = useLang();
  const sL = SHELL_L[lang];
  return (
    <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">{sL.legal}</p>
        <h1 className="nv-display mt-3 text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-[var(--mk-ink-soft)]">{sL.updated} {updated}</p>
        <div className="mt-8 border-t border-dashed border-[var(--mk-line)]" />
      </div>
      <article
        className="space-y-5 text-[15px] leading-relaxed text-[var(--mk-ink-soft)]
          [&_a]:font-medium [&_a]:text-violet-600 [&_a:hover]:underline
          [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--mk-ink)]
          [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-[var(--mk-ink)]
          [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
          [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5
          [&_strong]:font-semibold [&_strong]:text-[var(--mk-ink)]"
      >
        {children}
      </article>
    </div>
  );
}
