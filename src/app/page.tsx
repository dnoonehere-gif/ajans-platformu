"use client";
import { LogoMark } from "@/components/logo";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Sparkles, Bot, BarChart3, QrCode, Globe, Star,
  ArrowRight, CheckCircle2, Zap, Shield, TrendingUp,
  MessageSquare, Users, ChevronRight, Play,
  UtensilsCrossed, MapPin, Building2, Menu, X,
} from "lucide-react";
import BorderGlow from "@/components/reactbits/border-glow";
import ElectricBorder from "@/components/reactbits/electric-border";

// Canvas bileşeni — SSR kapalı, sadece istemcide yüklenir
const DotField = dynamic(() => import("@/components/reactbits/dot-field"), { ssr: false });

/* ── Scroll ile görünür olan sarmalayıcı ───────────────────── */
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
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
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ── Özellik kartı ─────────────────────────────────────────── */
function FeatureCard({ icon: Icon, title, desc, accent, delay }: {
  icon: React.ElementType; title: string; desc: string; accent: string; delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.05] hover:shadow-[0_8px_40px_-12px_rgba(139,92,246,0.35)]">
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${accent}26, ${accent}0d)` }}
        >
          <Icon className="h-6 w-6" style={{ color: accent }} />
        </div>
        <h3 className="mb-2 text-base font-bold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
        <div
          className="absolute bottom-0 left-0 right-0 h-px scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      </div>
    </Reveal>
  );
}

/* ── Stat kartı ────────────────────────────────────────────── */
function StatCard({ value, label, icon: Icon, delay }: {
  value: string; label: string; icon: React.ElementType; delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-6 py-7 transition hover:border-violet-400/25 hover:bg-white/[0.05]">
        <Icon className="h-6 w-6 text-violet-400" />
        <p className="text-3xl font-black text-white">{value}</p>
        <p className="text-center text-sm text-slate-400">{label}</p>
      </div>
    </Reveal>
  );
}

const FEATURES = [
  { icon: Globe, title: "AI Web Sitesi Kurucu", desc: "Birkaç soruyu yanıtlayın, dakikalar içinde profesyonel kurumsal siteniz hazır olsun.", accent: "#8b5cf6", delay: 0 },
  { icon: Bot, title: "AI Chatbot", desc: "Markanıza özel eğitilmiş akıllı asistan. 7/24 müşterilerinize yanıt verir.", accent: "#38bdf8", delay: 60 },
  { icon: Sparkles, title: "AI İçerik Üreticisi", desc: "Instagram, blog, reklam metinleri ve 30 günlük içerik takvimi tek tıkla.", accent: "#e879f9", delay: 120 },
  { icon: BarChart3, title: "AI Dashboard", desc: "Günlük otomatik performans özeti, öneriler ve büyüme analizi.", accent: "#34d399", delay: 180 },
  { icon: QrCode, title: "QR Geri Bildirim", desc: "Müşteri yorumlarını QR kod ile toplayın, yapay zekâ ile analiz edin.", accent: "#fb923c", delay: 240 },
  { icon: Star, title: "Yorum Analizi", desc: "Google yorumlarınızı çekin, duygu analizi yapın, iyileştirme önerileri alın.", accent: "#facc15", delay: 300 },
  { icon: UtensilsCrossed, title: "Dijital Menü", desc: "Restoran ve kafeler için QR menü; görsel menü, web sayfası ve otomatik QR tek tıkla.", accent: "#fb7185", delay: 360 },
  { icon: MapPin, title: "Google Business", desc: "Google işletme profilinizi bağlayın, konum ve yorumlarınızı tek panelden yönetin.", accent: "#60a5fa", delay: 420 },
  { icon: Building2, title: "Şube Yönetimi", desc: "Birden fazla şubenizi, adreslerini ve çalışanlarını tek yerden yönetin.", accent: "#2dd4bf", delay: 480 },
  { icon: Users, title: "Takım & Yetkiler", desc: "Ekibinizi davet edin, rol bazlı yetkilerle güvenli iş birliği yapın.", accent: "#a78bfa", delay: 540 },
];

const STEPS = [
  { num: "01", title: "Kaydolun", desc: "Ücretsiz hesap açın, tüm özellikleri keşfedin." },
  { num: "02", title: "Markanızı Ekleyin", desc: "İşletme bilgilerinizi girin, logo yükleyin." },
  { num: "03", title: "AI'ı Çalıştırın", desc: "Website, chatbot, içerik — hepsi otomatik hazırlanır." },
  { num: "04", title: "Büyüyün", desc: "Analizleri takip edin, müşterilerinizle bağlantıda kalın." },
];

export default function AnaSayfa() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="min-h-screen bg-[#07070e] text-white selection:bg-violet-500/40">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "border-b border-white/[0.06] bg-[#07070e]/85 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-sm font-bold text-white">Novelya</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#ozellikler" className="text-sm text-slate-400 transition hover:text-white">Özellikler</a>
            <a href="#nasil-calisir" className="text-sm text-slate-400 transition hover:text-white">Nasıl Çalışır?</a>
            <Link href="/fiyatlar" className="text-sm text-slate-400 transition hover:text-white">Fiyatlar</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/giris" className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:block">Giriş Yap</Link>
            <Link href="/kayit" className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90 hover:shadow-violet-500/40">
              Ücretsiz Başla
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 md:hidden"
              aria-label="Menü"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-white/[0.06] bg-[#0a0a14]/95 px-6 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#ozellikler" onClick={() => setMenuOpen(false)} className="text-sm text-slate-300">Özellikler</a>
              <a href="#nasil-calisir" onClick={() => setMenuOpen(false)} className="text-sm text-slate-300">Nasıl Çalışır?</a>
              <Link href="/fiyatlar" className="text-sm text-slate-300">Fiyatlar</Link>
              <Link href="/giris" className="text-sm text-slate-300">Giriş Yap</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-16 text-center">
        {/* DotField arka plan */}
        <div className="pointer-events-none absolute inset-0">
          <DotField
            dotRadius={1.6}
            dotSpacing={15}
            bulgeStrength={55}
            glowRadius={180}
            sparkle
            waveAmplitude={1.2}
            gradientFrom="rgba(139, 92, 246, 0.4)"
            gradientTo="rgba(99, 102, 241, 0.18)"
            glowColor="#1b1233"
            style={{ pointerEvents: "auto" }}
          />
          {/* Vinyet — kenarlarda karart, içerik okunur kalsın */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(7,7,14,0.55)_65%,#07070e_100%)]" />
          {/* Üstten mor ışıma */}
          <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        </div>

        <div className="pointer-events-none relative z-10 max-w-4xl">
          {/* Badge */}
          <div className="pointer-events-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 backdrop-blur">
            <Zap className="h-3.5 w-3.5" />
            Türkiye&apos;nin Yeni Nesil AI Dijital Ajansı
          </div>

          {/* Başlık */}
          <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-white md:text-7xl">
            İşletmenizi{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              yapay zekâ
            </span>{" "}
            ile büyütün
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            Web sitesi kurun, chatbot eğitin, içerik üretin, yorumları analiz edin.{" "}
            <strong className="font-semibold text-slate-200">Tek panel, sıfır teknik bilgi, tamamen Türkçe.</strong>
          </p>

          {/* CTA butonları */}
          <div className="pointer-events-auto mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/kayit"
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_-8px_rgba(139,92,246,0.8)]"
            >
              Hemen Başla
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/giris"
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 text-base font-semibold text-slate-200 backdrop-blur transition hover:border-violet-400/30 hover:bg-white/[0.07]"
            >
              <Play className="h-4 w-4 text-violet-400" />
              Demo İzle
            </Link>
          </div>

          {/* Sosyal kanıt */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {[
              "Kredi kartı gerekmez",
              "Türkçe destek",
              "İstediğin zaman iptal",
              "7/24 destek",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Mockup kartı — BorderGlow sarmalı */}
        <div className="relative z-10 mt-20 w-full max-w-3xl">
          <BorderGlow
            backgroundColor="#0c0c16"
            borderRadius={24}
            glowColor="262 70 75"
            glowIntensity={0.9}
            colors={["#8b5cf6", "#e879f9", "#38bdf8"]}
            animated
          >
            <div className="overflow-hidden rounded-3xl">
              {/* Tarayıcı çubuğu */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <div className="h-3 w-3 rounded-full bg-green-400/80" />
                <div className="ml-4 flex-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1 text-left text-xs text-slate-500">
                  novelya.com.tr/dashboard
                </div>
              </div>
              {/* Dashboard önizleme */}
              <div className="grid grid-cols-4 gap-0">
                {/* Sidebar */}
                <div className="col-span-1 space-y-2 border-r border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex h-8 w-full items-center gap-2 rounded-lg bg-violet-500/20 px-2">
                    <div className="h-3 w-3 rounded bg-violet-400" />
                    <div className="h-2 w-16 rounded bg-violet-400/50" />
                  </div>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex h-7 w-full items-center gap-2 rounded-lg bg-white/[0.04] px-2">
                      <div className="h-2.5 w-2.5 rounded bg-white/20" />
                      <div className="h-1.5 rounded bg-white/10" style={{ width: `${40 + i * 8}%` }} />
                    </div>
                  ))}
                </div>
                {/* İçerik */}
                <div className="col-span-3 space-y-3 p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Toplam Yorum", value: "247", color: "text-violet-300 bg-violet-500/15" },
                      { label: "Ort. Puan", value: "4.8★", color: "text-emerald-300 bg-emerald-500/15" },
                      { label: "Bu Hafta", value: "+12", color: "text-sky-300 bg-sky-500/15" },
                    ].map((c) => (
                      <div key={c.label} className={`rounded-xl p-3 text-left ${c.color}`}>
                        <p className="text-[10px] opacity-70">{c.label}</p>
                        <p className="text-lg font-black">{c.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5 rounded-xl bg-white/[0.03] p-3">
                    {[80, 55, 90, 40, 70].map((w, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-400" style={{ width: `${w}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-left">
                    <div className="mb-2 flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-[10px] font-semibold text-emerald-300">AI Öneri</span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded bg-emerald-400/25" />
                      <div className="h-1.5 w-4/5 rounded bg-emerald-400/25" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BorderGlow>
        </div>
      </section>

      {/* ── İstatistikler ── */}
      <section className="relative px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard value="120+" label="Kayıtlı İşletme" icon={Users} delay={0} />
            <StatCard value="4.8★" label="Kullanıcı Memnuniyeti" icon={Star} delay={80} />
            <StatCard value="8.500+" label="Analiz Edilen Yorum" icon={MessageSquare} delay={160} />
            <StatCard value="%90" label="Ajans Maliyetinden Tasarruf" icon={TrendingUp} delay={240} />
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section id="ozellikler" className="relative px-6 py-24">
        {/* Arka ışıma */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              Tüm Araçlar Tek Yerde
            </div>
            <h2 className="text-4xl font-black text-white md:text-5xl">
              İşletmeniz için ihtiyaç{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                duyduğunuz her şey
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-400">
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
      <section id="nasil-calisir" className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black text-white md:text-5xl">
              4 adımda{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">başlayın</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 100} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute top-6 left-full z-0 hidden h-px w-6 bg-gradient-to-r from-violet-400/40 to-transparent lg:block" />
                )}
                <div className="relative z-10 h-full rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition hover:border-violet-400/25 hover:bg-white/[0.05]">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/10">
                    <span className="text-lg font-black text-violet-300">{s.num}</span>
                  </div>
                  <h3 className="mb-2 font-bold text-white">{s.title}</h3>
                  <p className="text-sm text-slate-400">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Güven ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {[
                  { icon: Shield, title: "SSL & Güvenli", desc: "Tüm verileriniz şifrelenerek saklanır." },
                  { icon: Zap, title: "Hızlı Kurulum", desc: "10 dakikada kurulum, hemen kullanmaya başlayın." },
                  { icon: MessageSquare, title: "Türkçe Destek", desc: "Sorunlarınız için yanınızdayız." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                      <Icon className="h-5 w-5 text-violet-300" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{title}</p>
                      <p className="mt-1 text-sm text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA — ElectricBorder ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <ElectricBorder
              color="#8b5cf6"
              speed={0.8}
              chaos={0.08}
              style={{ borderRadius: 24 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12102a] to-[#0c0a1e] p-12">
                {/* Arka plan deseni */}
                <div className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                  }}
                />
                <div className="relative z-10">
                  <h2 className="text-4xl font-black text-white md:text-5xl">
                    Hemen başlayın
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-slate-400">
                    Dakikalar içinde kurun. İstediğiniz zaman iptal edin.
                  </p>
                  <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Link
                      href="/kayit"
                      className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_0_60px_-8px_rgba(139,92,246,0.85)]"
                    >
                      Ücretsiz Hesap Oluştur
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/giris"
                      className="flex items-center gap-2 rounded-2xl border border-white/15 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/[0.06]"
                    >
                      Giriş Yap <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </ElectricBorder>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] bg-[#05050a] px-6">
        <div className="mx-auto max-w-6xl py-14">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <LogoMark size={32} />
                <span className="font-bold text-white">Novelya</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
                İşletmeniz için yapay zeka destekli dijital ajans: website, chatbot,
                içerik, menü ve müşteri yönetimi tek platformda.
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Ürün</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><a href="#ozellikler" className="transition hover:text-violet-400">Özellikler</a></li>
                <li><a href="/fiyatlar" className="transition hover:text-violet-400">Fiyatlar</a></li>
                <li><a href="/kayit" className="transition hover:text-violet-400">Ücretsiz Başla</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Kurumsal</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><a href="/hakkimizda" className="transition hover:text-violet-400">Hakkımızda</a></li>
                <li><a href="/iletisim" className="transition hover:text-violet-400">İletişim</a></li>
                <li><a href="/sss" className="transition hover:text-violet-400">SSS</a></li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Yasal</p>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
                <li><a href="/kullanim-sartlari" className="transition hover:text-violet-400">Kullanım Şartları</a></li>
                <li><a href="/gizlilik" className="transition hover:text-violet-400">Gizlilik Politikası</a></li>
                <li><a href="/kvkk" className="transition hover:text-violet-400">KVKK Aydınlatma</a></li>
                <li><a href="/cerez-politikasi" className="transition hover:text-violet-400">Çerez Politikası</a></li>
                <li><a href="/iade-politikasi" className="transition hover:text-violet-400">İade &amp; İptal</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-sm text-slate-600 sm:flex-row">
            <p>© {new Date().getFullYear()} Novelya. Tüm hakları saklıdır.</p>
            <p>Türkiye’de sevgiyle geliştirildi ✨</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
