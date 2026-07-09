import Link from "next/link";
import { LogoMark } from "@/components/logo";

const FOOTER_COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Ürün",
    links: [
      { label: "Özellikler", href: "/#ozellikler" },
      { label: "Fiyatlar", href: "/fiyatlar" },
      { label: "Website Builder", href: "/#ozellikler" },
      { label: "Dijital Menü", href: "/#ozellikler" },
      { label: "QR Geri Bildirim", href: "/#ozellikler" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { label: "Hakkımızda", href: "/hakkimizda" },
      { label: "İletişim", href: "/iletisim" },
      { label: "SSS", href: "/sss" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Kullanım Şartları", href: "/kullanim-sartlari" },
      { label: "Gizlilik Politikası", href: "/gizlilik" },
      { label: "KVKK Aydınlatma Metni", href: "/kvkk" },
      { label: "Çerez Politikası", href: "/cerez-politikasi" },
      { label: "İade & İptal Politikası", href: "/iade-politikasi" },
    ],
  },
];

/** Ortak pazarlama sayfası kabuğu: üst menü + zengin footer. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-violet-50/30 to-white text-gray-800">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="font-bold text-gray-900">Novelya</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-500 md:flex">
            <Link href="/#ozellikler" className="transition hover:text-gray-900">Özellikler</Link>
            <Link href="/fiyatlar" className="transition hover:text-gray-900">Fiyatlar</Link>
            <Link href="/sss" className="transition hover:text-gray-900">SSS</Link>
            <Link href="/iletisim" className="transition hover:text-gray-900">İletişim</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/giris" className="hidden text-sm font-semibold text-gray-600 transition hover:text-gray-900 sm:block">
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* İçerik */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Marka */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <LogoMark size={32} />
                <span className="font-bold text-gray-900">Novelya</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
                İşletmeniz için yapay zeka destekli dijital ajans:
                website, chatbot, içerik, menü ve müşteri yönetimi tek platformda.
              </p>
            </div>

            {/* Link kolonları */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-bold text-gray-900">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-gray-500 transition hover:text-violet-700">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 text-sm text-gray-400 sm:flex-row">
            <p>© {new Date().getFullYear()} Novelya. Tüm hakları saklıdır.</p>
            <p>Türkiye’de sevgiyle geliştirildi ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Yasal metinler için tutarlı tipografi sarmalayıcısı. */
export function LegalArticle({
  title, updated, children,
}: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 border-b border-gray-100 pb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">Yasal</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900 sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-gray-400">Son güncelleme: {updated}</p>
      </div>
      <article
        className="space-y-5 text-[15px] leading-relaxed text-gray-600
          [&_a]:font-medium [&_a]:text-violet-700 [&_a:hover]:underline
          [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900
          [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-gray-900
          [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5
          [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5
          [&_strong]:font-semibold [&_strong]:text-gray-800"
      >
        {children}
      </article>
    </div>
  );
}
