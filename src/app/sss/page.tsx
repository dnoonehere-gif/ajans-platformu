"use client";
import { useState } from "react";
import { ChevronDown, Search, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";

interface Faq { q: string; a: string; cat: string }

const FAQS: Faq[] = [
  // Genel
  { cat: "Genel", q: "Ajans Platformu nedir?", a: "Ajans Platformu; website oluşturma, chatbot, yapay zeka içerik üretimi, dijital menü, QR geri bildirim ve müşteri yönetimini tek çatı altında toplayan, işletmeler için tasarlanmış bir dijital ajans platformudur." },
  { cat: "Genel", q: "Teknik bilgim yok, yine de kullanabilir miyim?", a: "Evet. Platform, teknik bilgi gerektirmeden kullanılacak şekilde tasarlandı. Bilgileri girmeniz yeterli; website, menü ve içerikler otomatik olarak oluşturulur." },
  { cat: "Genel", q: "Hangi işletmeler için uygun?", a: "Kafeler, restoranlar, mağazalar, güzellik salonları, oteller ve hizmet veren tüm küçük-orta ölçekli işletmeler için uygundur." },
  // Fiyatlandırma
  { cat: "Fiyatlandırma", q: "Ücretsiz deneme var mı?", a: "Evet, tüm ücretli planlar 14 gün ücretsiz deneme ile başlar. Deneme için kredi kartı bilgisi gerekmez." },
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

const CATS = ["Tümü", "Genel", "Fiyatlandırma", "Özellikler", "Güvenlik & Veri"];

export default function SssPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [cat, setCat] = useState("Tümü");
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter((f) => {
    const matchCat = cat === "Tümü" || f.cat === cat;
    const matchSearch = !search.trim() ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <PageShell>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            <HelpCircle className="h-3.5 w-3.5" /> Yardım Merkezi
          </span>
          <h1 className="mt-5 text-4xl font-black text-gray-900 sm:text-5xl">Sık Sorulan Sorular</h1>
          <p className="mt-4 text-lg text-gray-600">Merak ettiklerinizin cevabı burada.</p>

          {/* Arama */}
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Soru ara..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>
        </div>

        {/* Kategori filtreleri */}
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setOpen(null); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                cat === c ? "bg-violet-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-violet-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Liste */}
        <div className="mx-auto mt-8 max-w-3xl space-y-3">
          {filtered.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70 backdrop-blur">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-gray-900">{f.q}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-violet-500 transition ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{f.a}</div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="mb-3 text-5xl">🔍</div>
              <p className="text-gray-500">“{search}” için sonuç bulunamadı.</p>
            </div>
          )}
        </div>

        {/* Yardımcı olmadı mı */}
        <div className="mx-auto mt-12 max-w-3xl rounded-3xl bg-gradient-to-br from-gray-900 to-violet-900 p-8 text-center text-white">
          <MessageSquare className="mx-auto h-8 w-8 text-violet-300" />
          <h2 className="mt-3 text-xl font-bold">Cevabını bulamadınız mı?</h2>
          <p className="mt-2 text-sm text-violet-200">Ekibimiz size yardımcı olmaktan memnuniyet duyar.</p>
          <Link href="/iletisim" className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-700 transition hover:-translate-y-0.5">
            Bize Ulaşın
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
