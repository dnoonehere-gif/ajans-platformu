"use client";
import { LogoMark } from "@/components/logo";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Bot, BarChart3, QrCode, Globe, Star,
  ArrowRight, CheckCircle2, Zap, Shield, TrendingUp,
  MessageSquare, Users, ChevronRight, Play,
} from "lucide-react";

/* ── Yüzen şekil arka planı ────────────────────────────────── */
function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Büyük daireler */}
      <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/10 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="absolute top-1/2 -left-48 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-400/15 to-cyan-400/10 blur-3xl animate-pulse" style={{ animationDuration: "8s", animationDelay: "2s" }} />
      <div className="absolute -bottom-32 right-1/3 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-purple-400/15 to-pink-400/10 blur-3xl animate-pulse" style={{ animationDuration: "7s", animationDelay: "1s" }} />

      {/* Küçük şekiller */}
      {[
        { top: "12%", left: "8%", size: 48, color: "bg-violet-500/20", delay: "0s" },
        { top: "25%", right: "6%", size: 32, color: "bg-blue-500/20", delay: "1s" },
        { top: "60%", left: "4%", size: 40, color: "bg-indigo-500/20", delay: "2s" },
        { top: "75%", right: "10%", size: 24, color: "bg-purple-500/20", delay: "0.5s" },
        { top: "40%", left: "18%", size: 16, color: "bg-pink-500/30", delay: "1.5s" },
        { top: "85%", left: "30%", size: 20, color: "bg-cyan-500/20", delay: "3s" },
      ].map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${s.color} animate-bounce`}
          style={{
            top: s.top, left: (s as { left?: string }).left, right: (s as { right?: string }).right,
            width: s.size, height: s.size,
            animationDuration: `${3 + i * 0.5}s`,
            animationDelay: s.delay,
          }}
        />
      ))}

      {/* Grid deseni */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(245 80% 30%) 1px, transparent 1px), linear-gradient(90deg, hsl(245 80% 30%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

/* ── Özellik kartı ─────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, color, delay }: {
  icon: React.ElementType; title: string; desc: string; color: string; delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-violet-200"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="mb-2 text-base font-bold text-gray-900">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 bg-gradient-to-r from-violet-500 to-indigo-500 transition-transform duration-300 group-hover:scale-x-100" />
    </div>
  );
}

/* ── Stat kartı ────────────────────────────────────────────── */
function StatCard({ value, label, icon: Icon }: { value: string; label: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/70 bg-white/70 px-8 py-6 shadow-sm backdrop-blur">
      <Icon className="h-6 w-6 text-violet-500" />
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

const FEATURES = [
  { icon: Globe, title: "AI Web Sitesi Kurucu", desc: "Birkaç soruyu yanıtlayın, dakikalar içinde profesyonel kurumsal siteniz hazır olsun.", color: "bg-gradient-to-br from-violet-500 to-indigo-600", delay: 0 },
  { icon: Bot, title: "AI Chatbot", desc: "Markanıza özel eğitilmiş akıllı asistan. 7/24 müşterilerinize yanıt verir.", color: "bg-gradient-to-br from-blue-500 to-cyan-600", delay: 100 },
  { icon: Sparkles, title: "AI İçerik Üreticisi", desc: "Instagram, blog, reklam metinleri ve 30 günlük içerik takvimi tek tıkla.", color: "bg-gradient-to-br from-purple-500 to-pink-600", delay: 200 },
  { icon: BarChart3, title: "AI Dashboard", desc: "Günlük otomatik performans özeti, öneriler ve büyüme analizi.", color: "bg-gradient-to-br from-emerald-500 to-teal-600", delay: 300 },
  { icon: QrCode, title: "QR Geri Bildirim", desc: "Müşteri yorumlarını QR kod ile toplayın, yapay zekâ ile analiz edin.", color: "bg-gradient-to-br from-orange-500 to-red-500", delay: 400 },
  { icon: Star, title: "Yorum Analizi", desc: "Google yorumlarınızı çekin, duygu analizi yapın, iyileştirme önerileri alın.", color: "bg-gradient-to-br from-yellow-500 to-orange-500", delay: 500 },
];

const STEPS = [
  { num: "01", title: "Kaydolun", desc: "Ücretsiz hesap açın, 14 gün tüm özellikleri deneyin." },
  { num: "02", title: "Markanızı Ekleyin", desc: "İşletme bilgilerinizi girin, logo yükleyin." },
  { num: "03", title: "AI'ı Çalıştırın", desc: "Website, chatbot, içerik — hepsi otomatik hazırlanır." },
  { num: "04", title: "Büyüyün", desc: "Analizleri takip edin, müşterilerinizle bağlantıda kalın." },
];

export default function AnaSayfa() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 text-gray-900">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "border-b border-white/80 bg-white/90 shadow-sm backdrop-blur" : "bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-sm font-bold text-gray-900">Novelya</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {["Özellikler", "Nasıl Çalışır?", "Fiyatlar"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/[^a-z]/g, "")}`} className="text-sm text-gray-500 transition hover:text-gray-900">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/giris" className="text-sm font-medium text-gray-600 transition hover:text-gray-900">Giriş Yap</Link>
            <Link href="/kayit" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90 hover:shadow-violet-500/40">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16 text-center">
        <FloatingShapes />

        <div className="relative z-10 max-w-4xl">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700">
            <Zap className="h-3.5 w-3.5" />
            Türkiye&apos;nin Yeni Nesil AI Dijital Ajansı
          </div>

          {/* Başlık */}
          <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-gray-900 md:text-7xl">
            İşletmenizi{" "}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              yapay zekâ
            </span>{" "}
            ile büyütün
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
            Web sitesi kurun, chatbot eğitin, içerik üretin, yorumları analiz edin.{" "}
            <strong className="text-gray-700">Tek panel, sıfır teknik bilgi, tamamen Türkçe.</strong>
          </p>

          {/* CTA butonları */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/kayit"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/30 transition hover:shadow-violet-500/50 hover:-translate-y-0.5"
            >
              14 Gün Ücretsiz Dene
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/giris"
              className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/80 px-8 py-4 text-base font-semibold text-gray-700 shadow-sm backdrop-blur transition hover:border-violet-200 hover:shadow-md"
            >
              <Play className="h-4 w-4 text-violet-500" />
              Demo İzle
            </Link>
          </div>

          {/* Sosyal kanıt */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              "Kredi kartı gerekmez",
              "14 gün ücretsiz",
              "Türkçe destek",
              "İptal istediğinde",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Mockup kartı */}
        <div className="relative z-10 mt-20 w-full max-w-3xl">
          <div className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl shadow-gray-200/80 backdrop-blur">
            {/* Tarayıcı çubuğu */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 rounded-lg bg-white/80 px-3 py-1 text-xs text-gray-400 border border-gray-200">
                novelya.com/dashboard
              </div>
            </div>
            {/* Dashboard önizleme */}
            <div className="grid grid-cols-4 gap-0">
              {/* Sidebar */}
              <div className="col-span-1 border-r border-gray-100 bg-gray-50/50 p-4 space-y-2">
                <div className="h-8 w-full rounded-lg bg-violet-100/80 flex items-center px-2 gap-2">
                  <div className="h-3 w-3 rounded bg-violet-400" />
                  <div className="h-2 w-16 rounded bg-violet-300/60" />
                </div>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-7 w-full rounded-lg bg-gray-100/80 flex items-center px-2 gap-2">
                    <div className="h-2.5 w-2.5 rounded bg-gray-300" />
                    <div className="h-1.5 rounded bg-gray-200" style={{ width: `${40 + i * 8}%` }} />
                  </div>
                ))}
              </div>
              {/* İçerik */}
              <div className="col-span-3 p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Toplam Yorum", value: "247", color: "text-violet-600 bg-violet-50" },
                    { label: "Ort. Puan", value: "4.8★", color: "text-emerald-600 bg-emerald-50" },
                    { label: "Bu Hafta", value: "+12", color: "text-blue-600 bg-blue-50" },
                  ].map((c) => (
                    <div key={c.label} className={`rounded-xl p-3 ${c.color}`}>
                      <p className="text-[10px] opacity-70">{c.label}</p>
                      <p className="text-lg font-black">{c.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-gray-50 p-3 space-y-1.5">
                  {[80, 55, 90, 40, 70].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-violet-200 flex-1">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all" style={{ width: `${w}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-700">AI Öneri</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 rounded bg-emerald-200 w-full" />
                    <div className="h-1.5 rounded bg-emerald-200 w-4/5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Gölge efekti */}
          <div className="absolute -bottom-4 left-8 right-8 h-8 rounded-full bg-gray-300/40 blur-xl" />
        </div>
      </section>

      {/* ── İstatistikler ── */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard value="500+" label="Aktif İşletme" icon={Users} />
            <StatCard value="4.9★" label="Ortalama Puan" icon={Star} />
            <StatCard value="50K+" label="Yönetilen Yorum" icon={MessageSquare} />
            <StatCard value="%98" label="Müşteri Memnuniyeti" icon={TrendingUp} />
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section id="özellikler" className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Tüm Araçlar Tek Yerde
            </div>
            <h2 className="text-4xl font-black text-gray-900 md:text-5xl">
              İşletmeniz için ihtiyaç{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                duyduğunuz her şey
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              Yapay zekâ destekli araçlarla dijital varlığınızı güçlendirin. Teknik bilgi gerekmez.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Nasıl Çalışır ── */}
      <section id="nasılçalışır" className="py-24 px-6 bg-gradient-to-b from-white to-violet-50/50">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black text-gray-900 md:text-5xl">
              4 adımda{" "}
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">başlayın</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute top-6 left-full z-0 hidden h-px w-6 bg-gradient-to-r from-violet-300 to-transparent lg:block" />
                )}
                <div className="relative z-10 rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
                    <span className="text-lg font-black text-violet-600">{s.num}</span>
                  </div>
                  <h3 className="mb-2 font-bold text-gray-900">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Güven ── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/50 p-10 shadow-sm">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                { icon: Shield, title: "SSL & Güvenli", desc: "Tüm verileriniz şifrelenerek saklanır." },
                { icon: Zap, title: "Hızlı Kurulum", desc: "10 dakikada kurulum, hemen kullanmaya başlayın." },
                { icon: MessageSquare, title: "Türkçe Destek", desc: "Sorunlarınız için yanınızdayız." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                    <Icon className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-12 shadow-2xl shadow-violet-500/30">
            {/* Arka plan deseni */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white md:text-5xl">
                Hemen başlayın
              </h2>
              <p className="mx-auto mt-4 max-w-md text-violet-200">
                14 gün ücretsiz deneyin. Kredi kartı gerekmez. İstediğiniz zaman iptal edin.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/kayit"
                  className="group flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Ücretsiz Hesap Oluştur
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/giris"
                  className="flex items-center gap-2 rounded-2xl border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                >
                  Giriş Yap <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white/80 px-6 backdrop-blur">
        <div className="mx-auto max-w-6xl py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <LogoMark size={32} />
                <span className="font-bold text-gray-900">Novelya</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
                İşletmeniz için yapay zeka destekli dijital ajans: website, chatbot,
                içerik, menü ve müşteri yönetimi tek platformda.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">Ürün</p>
              <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
                <li><a href="#özellikler" className="transition hover:text-violet-700">Özellikler</a></li>
                <li><a href="/fiyatlar" className="transition hover:text-violet-700">Fiyatlar</a></li>
                <li><a href="/kayit" className="transition hover:text-violet-700">Ücretsiz Başla</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">Kurumsal</p>
              <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
                <li><a href="/hakkimizda" className="transition hover:text-violet-700">Hakkımızda</a></li>
                <li><a href="/iletisim" className="transition hover:text-violet-700">İletişim</a></li>
                <li><a href="/sss" className="transition hover:text-violet-700">SSS</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">Yasal</p>
              <ul className="mt-4 space-y-2.5 text-sm text-gray-500">
                <li><a href="/kullanim-sartlari" className="transition hover:text-violet-700">Kullanım Şartları</a></li>
                <li><a href="/gizlilik" className="transition hover:text-violet-700">Gizlilik Politikası</a></li>
                <li><a href="/kvkk" className="transition hover:text-violet-700">KVKK Aydınlatma</a></li>
                <li><a href="/cerez-politikasi" className="transition hover:text-violet-700">Çerez Politikası</a></li>
                <li><a href="/iade-politikasi" className="transition hover:text-violet-700">İade &amp; İptal</a></li>
              </ul>
            </div>
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
