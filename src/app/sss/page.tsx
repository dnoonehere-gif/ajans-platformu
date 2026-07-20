"use client";
import { useState } from "react";
import { ChevronDown, Search, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";
import { useLang } from "@/components/language-provider";

interface Faq { q: string; a: string; cat: string }

const FAQS: Faq[] = [
  // Genel
  { cat: "Genel", q: "Novelya nedir?", a: "Novelya; website oluşturma, chatbot, yapay zeka içerik üretimi, dijital menü, QR geri bildirim ve müşteri yönetimini tek çatı altında toplayan, işletmeler için tasarlanmış bir dijital ajans platformudur." },
  { cat: "Genel", q: "Teknik bilgim yok, yine de kullanabilir miyim?", a: "Evet. Platform, teknik bilgi gerektirmeden kullanılacak şekilde tasarlandı. Bilgileri girmeniz yeterli; website, menü ve içerikler otomatik olarak oluşturulur." },
  { cat: "Genel", q: "Hangi işletmeler için uygun?", a: "Kafeler, restoranlar, mağazalar, güzellik salonları, oteller ve hizmet veren tüm küçük-orta ölçekli işletmeler için uygundur." },
  // Fiyatlandırma
  { cat: "Fiyatlandırma", q: "Planı nasıl seçerim?", a: "Abonelik sayfasından size uygun planı seçip ödeme yapabilirsiniz. İstediğiniz zaman plan değiştirebilir veya iptal edebilirsiniz." },
  { cat: "Fiyatlandırma", q: "İstediğim zaman iptal edebilir miyim?", a: "Evet. Aboneliğinizi hesabınızdaki Abonelik sayfasından dilediğiniz zaman iptal edebilirsiniz. İptal, dönem sonunda geçerli olur ve yeni ücret alınmaz." },
  { cat: "Fiyatlandırma", q: "Plan yükseltme/düşürme yapabilir miyim?", a: "Evet. Planınızı istediğiniz zaman değiştirebilirsiniz. Değişiklik bir sonraki fatura döneminde geçerli olur." },
  { cat: "Fiyatlandırma", q: "İade alabilir miyim?", a: "İade koşulları planınıza göre değişir. Ayrıntılar için İade & İptal Politikası sayfamızı inceleyebilirsiniz." },
  // Özellikler
  { cat: "Özellikler", q: "Yapay zeka içerikleri gerçekten kullanılabilir mi?", a: "Evet. En güncel yapay zeka modelleriyle sektörünüze özel içerikler üretilir. Yayımlamadan önce düzenleme ve kontrol imkanı sunulur." },
  { cat: "Özellikler", q: "Dijital menü nasıl çalışır?", a: "Ürün ve kategorilerinizi girersiniz; sistem hem görsel bir menü hem de mobil uyumlu bir web menüsü oluşturur ve otomatik bir QR kod üretir. Müşteriler QR’ı okutup menüyü görüntüler." },
  { cat: "Özellikler", q: "Chatbot'u kendi siteme ekleyebilir miyim?", a: "Evet. Oluşturduğunuz chatbot'u kendi web sitenize kolayca gömebilir, marka bilgilerinizle eğitebilirsiniz." },
  { cat: "Özellikler", q: "QR geri bildirim ne işe yarar?", a: "Masalara veya fişlere koyduğunuz QR kodları müşterilerinizin yorum bırakmasını sağlar. Yorumlar otomatik olarak Yorum Analizi panelinize düşer." },
  // Güvenlik
  { cat: "Güvenlik & Veri", q: "Verilerim güvende mi?", a: "Evet. Verileriniz şifrelenerek saklanır, şifreleriniz geri döndürülemez biçimde korunur. Tüm işlemler KVKK’ya uygun yürütülür." },
  { cat: "Güvenlik & Veri", q: "Verilerimi dışa aktarabilir miyim?", a: "Oluşturduğunuz içerikler size aittir. Hesabınızdan verilerinizi görüntüleyebilir ve destek ekibimizden dışa aktarma talep edebilirsiniz." },
  { cat: "Güvenlik & Veri", q: "Hesabımı silersem ne olur?", a: "Hesabınızı kapattığınızda verileriniz mevzuatın izin verdiği süre içinde silinir veya anonim hale getirilir." },
];

const FAQS_EN: Faq[] = [
  { cat: "General", q: "What is Novelya?", a: "Novelya is a digital agency platform designed for businesses, bringing website building, chatbots, AI content generation, digital menus, QR feedback and customer management together under one roof." },
  { cat: "General", q: "I have no technical knowledge — can I still use it?", a: "Yes. The platform is designed to be used without any technical knowledge. You just enter your details; websites, menus and content are generated automatically." },
  { cat: "General", q: "Which businesses is it suitable for?", a: "It suits cafes, restaurants, shops, beauty salons, hotels and all small to medium-sized service businesses." },
  { cat: "Pricing", q: "How do I choose a plan?", a: "You can pick the plan that suits you from the Subscription page and complete the payment. You can change or cancel your plan at any time." },
  { cat: "Pricing", q: "Can I cancel anytime?", a: "Yes. You can cancel your subscription at any time from the Subscription page in your account. Cancellation takes effect at the end of the period and no new charge is made." },
  { cat: "Pricing", q: "Can I upgrade or downgrade my plan?", a: "Yes. You can change your plan whenever you like. The change takes effect in the next billing period." },
  { cat: "Pricing", q: "Can I get a refund?", a: "Refund conditions vary by plan. See our Refund & Cancellation Policy page for details." },
  { cat: "Features", q: "Is AI-generated content actually usable?", a: "Yes. Content tailored to your industry is produced with the latest AI models, and you can review and edit it before publishing." },
  { cat: "Features", q: "How does the digital menu work?", a: "You enter your products and categories; the system creates both a visual menu and a mobile-friendly web menu, and generates a QR code automatically. Customers scan the QR to view the menu." },
  { cat: "Features", q: "Can I add the chatbot to my own website?", a: "Yes. You can easily embed the chatbot you create into your own website and train it with your brand information." },
  { cat: "Features", q: "What is QR feedback for?", a: "QR codes you place on tables or receipts let your customers leave reviews. Reviews land automatically in your Review Analysis panel." },
  { cat: "Security & Data", q: "Is my data safe?", a: "Yes. Your data is stored encrypted and your passwords are protected irreversibly. All processing is carried out in compliance with KVKK." },
  { cat: "Security & Data", q: "Can I export my data?", a: "The content you create belongs to you. You can view your data from your account and request an export from our support team." },
  { cat: "Security & Data", q: "What happens if I delete my account?", a: "When you close your account, your data is deleted or anonymised within the period permitted by legislation." },
];

const CATS = ["Tümü", "Genel", "Fiyatlandırma", "Özellikler", "Güvenlik & Veri"];
const CATS_EN = ["All", "General", "Pricing", "Features", "Security & Data"];

const UI = {
  tr: {
    helpCenter: "Yardım Merkezi", title: "Sık Sorulan Sorular",
    subtitle: "Merak ettiklerinizin cevabı burada.", searchPh: "Soru ara...",
    noResult: (q: string) => `“${q}” için sonuç bulunamadı.`,
    notFoundTitle: "Cevabını bulamadınız mı?",
    notFoundDesc: "Ekibimiz size yardımcı olmaktan memnuniyet duyar.",
    contact: "Bize Ulaşın",
  },
  en: {
    helpCenter: "Help Center", title: "Frequently Asked Questions",
    subtitle: "The answers you are looking for are here.", searchPh: "Search questions...",
    noResult: (q: string) => `No results found for “${q}”.`,
    notFoundTitle: "Couldn't find your answer?",
    notFoundDesc: "Our team is happy to help you.",
    contact: "Contact Us",
  },
};

export default function SssPage() {
  const { lang } = useLang();
  const sL = UI[lang];
  const faqs = lang === "en" ? FAQS_EN : FAQS;
  const cats = lang === "en" ? CATS_EN : CATS;
  const allLabel = cats[0];

  const [open, setOpen] = useState<number | null>(0);
  const [cat, setCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const activeCat = cat ?? allLabel;

  const filtered = faqs.filter((f) => {
    const matchCat = activeCat === allLabel || f.cat === activeCat;
    const matchSearch = !search.trim() ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <PageShell>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
            <HelpCircle className="h-3.5 w-3.5" /> {sL.helpCenter}
          </span>
          <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">{sL.title}</h1>
          <p className="mt-4 text-lg text-slate-400">{sL.subtitle}</p>

          {/* Arama */}
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={sL.searchPh}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Kategori filtreleri */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setOpen(null); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCat === c ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" : "border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {filtered.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] transition hover:border-violet-400/20">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-white">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-violet-400 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{f.a}</div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-3 text-5xl">🔍</div>
              <p className="text-slate-500">{sL.noResult(search)}</p>
            </div>
          )}
        </div>

        {/* Yardımcı olmadı mı */}
        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#12102a] to-[#0c0a1e] p-8 text-center text-white">
          <MessageSquare className="mx-auto h-8 w-8 text-violet-300" />
          <h2 className="mt-3 text-xl font-bold">{sL.notFoundTitle}</h2>
          <p className="mt-2 text-sm text-slate-400">{sL.notFoundDesc}</p>
          <Link href="/iletisim" className="mt-5 inline-block rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_-8px_rgba(139,92,246,0.5)] transition hover:-translate-y-0.5">
            {sL.contact}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
