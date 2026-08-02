"use client";
import { LogoMark } from "@/components/logo";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Bot, BarChart3, QrCode, Globe, Star,
  ArrowRight, Play, Users, CheckCircle2, UtensilsCrossed, MapPin, Building2, Menu, X,
  CalendarCheck, UserPlus, Mail, Send, Search, FileBarChart, Layers, Palette,
} from "lucide-react";
import { useLang } from "@/components/language-provider";
import { PublicControls } from "@/components/marketing/public-controls";

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
  { icon: CalendarCheck, title: "Chatbot ile Rezervasyon", desc: "Müşterileriniz chatbot ile konuşarak rezervasyon yapsın; SMS ve e-posta onayı otomatik gitsin.", accent: "#22d3ee", delay: 600 },
  { icon: UserPlus, title: "CRM & Satış Pipeline", desc: "Müşteri adaylarınızı aşama aşama takip edin. Chatbot rezervasyonları otomatik CRM'e düşer.", accent: "#818cf8", delay: 660 },
  { icon: Mail, title: "E-posta Pazarlama", desc: "Kişi listenize toplu kampanya gönderin, açılma oranlarını takip edin.", accent: "#fbbf24", delay: 720 },
  { icon: Send, title: "Sosyal Medya Planlayıcı", desc: "Instagram, Facebook ve LinkedIn paylaşımlarınızı planlayın, tek panelden yönetin.", accent: "#f472b6", delay: 780 },
  { icon: Search, title: "SEO Araçları", desc: "Sitenizi tarayın, rakip anahtar kelimeleri analiz edin, AI önerileri alın.", accent: "#4ade80", delay: 840 },
  { icon: FileBarChart, title: "Müşteri Raporları", desc: "Ajanslar için beyaz etiketli PDF raporlar; 9 metrik tek tıkla müşterinize hazır.", accent: "#c084fc", delay: 900 },
  { icon: Layers, title: "Toplu İçerik Üretimi", desc: "Tek seferde onlarca gönderi üretin; şablonlarla planlayın, CSV olarak dışa aktarın.", accent: "#38bdf8", delay: 960 },
  { icon: Palette, title: "White-Label", desc: "Kendi logonuz, renginiz ve alan adınızla sunun; platform tamamen sizin markanız görünür.", accent: "#fb7185", delay: 1020 },
];

const STEPS = [
  { num: "01", title: "Kaydolun", desc: "Ücretsiz hesap açın, tüm özellikleri keşfedin." },
  { num: "02", title: "Markanızı Ekleyin", desc: "İşletme bilgilerinizi girin, logo yükleyin." },
  { num: "03", title: "AI'ı Çalıştırın", desc: "Website, chatbot, içerik — hepsi otomatik hazırlanır." },
  { num: "04", title: "Büyüyün", desc: "Analizleri takip edin, müşterilerinizle bağlantıda kalın." },
];

// ── EN çevirileri (index eşlemeli) ──
const FEATURES_EN = [
  { title: "AI Website Builder", desc: "Answer a few questions and get a professional business website in minutes." },
  { title: "AI Chatbot", desc: "A smart assistant trained on your brand. Answers your customers 24/7." },
  { title: "AI Content Generator", desc: "Instagram, blog and ad copy plus a 30-day content calendar in one click." },
  { title: "AI Dashboard", desc: "Automatic daily performance summaries, suggestions and growth analytics." },
  { title: "QR Feedback", desc: "Collect customer reviews via QR code and analyze them with AI." },
  { title: "Review Analysis", desc: "Pull your Google reviews, run sentiment analysis, get improvement tips." },
  { title: "Digital Menu", desc: "QR menu for restaurants and cafes; visual menu, web page and QR in one click." },
  { title: "Google Business", desc: "Connect your Google Business profile, manage location and reviews in one panel." },
  { title: "Branch Management", desc: "Manage multiple branches, their addresses and staff from one place." },
  { title: "Team & Permissions", desc: "Invite your team and collaborate safely with role-based permissions." },
  { title: "Chatbot Reservations", desc: "Customers book by chatting with the bot; SMS and email confirmations are automatic." },
  { title: "CRM & Sales Pipeline", desc: "Track leads stage by stage. Chatbot reservations flow into CRM automatically." },
  { title: "Email Marketing", desc: "Send bulk campaigns to your contact list and track open rates." },
  { title: "Social Media Planner", desc: "Plan your Instagram, Facebook and LinkedIn posts from a single panel." },
  { title: "SEO Tools", desc: "Scan your site, analyze competitor keywords, get AI suggestions." },
  { title: "Client Reports", desc: "White-label PDF reports for agencies; 9 metrics ready for your client in one click." },
  { title: "Batch Content", desc: "Generate dozens of posts at once; plan with templates and export as CSV." },
  { title: "White-Label", desc: "Serve it under your own logo, colors and domain — the platform looks entirely like your brand." },
];

const STEPS_EN = [
  { title: "Sign Up", desc: "Create a free account and explore every feature." },
  { title: "Add Your Brand", desc: "Enter your business details and upload a logo." },
  { title: "Run the AI", desc: "Website, chatbot, content — everything is prepared automatically." },
  { title: "Grow", desc: "Track analytics and stay connected with your customers." },
];

const L = {
  tr: {
    navFeatures: "Özellikler",
    navHow: "Nasıl Çalışır?",
    navPricing: "Fiyatlar",
    navLogin: "Giriş Yap",
    navSignup: "Ücretsiz Başla",
    heroBadge: "Türkiye'nin Yeni Nesil AI Dijital Ajansı",
    heroT1: "İşletmenizi",
    heroGrad: "yapay zekâ",
    heroT2: "ile büyütün",
    heroDesc: "Web sitesi kurun, chatbot eğitin, içerik üretin, yorumları analiz edin.",
    heroDescBold: "Tek panel, sıfır teknik bilgi, tamamen Türkçe.",
    heroCta: "7 Gün Ücretsiz Dene",
    heroDemo: "Demo İzle",
    checks: ["7 gün ücretsiz deneme", "Kredi kartı gerekmez", "İstediğin zaman iptal", "Türkçe destek"],
    stats: ["Kayıtlı İşletme", "Kullanıcı Memnuniyeti", "Analiz Edilen Yorum", "Ajans Maliyetinden Tasarruf"],
    featBadge: "Tüm Araçlar Tek Yerde",
    featT1: "İşletmeniz için ihtiyaç",
    featGrad: "duyduğunuz her şey",
    featDesc: "Yapay zekâ destekli araçlarla dijital varlığınızı güçlendirin. Teknik bilgi gerekmez.",
    stepsT1: "4 adımda",
    stepsGrad: "başlayın",
    trust: [
      { title: "SSL & Güvenli", desc: "Tüm verileriniz şifrelenerek saklanır." },
      { title: "Hızlı Kurulum", desc: "10 dakikada kurulum, hemen kullanmaya başlayın." },
      { title: "Türkçe Destek", desc: "Sorunlarınız için yanınızdayız." },
    ],
    ctaTitle: "Hemen başlayın",
    ctaDesc: "7 gün ücretsiz deneyin — kredi kartı gerekmez. Dakikalar içinde kurun, istediğiniz zaman iptal edin.",
    ctaBtn: "Ücretsiz Hesap Oluştur",
    ctaLogin: "Giriş Yap",
    fDesc: "İşletmeniz için yapay zeka destekli dijital ajans: website, chatbot, içerik, menü ve müşteri yönetimi tek platformda.",
    fProduct: "Ürün",
    fCorp: "Kurumsal",
    fLegal: "Yasal",
    fAbout: "Hakkımızda",
    fContact: "İletişim",
    fFaq: "SSS",
    fTerms: "Kullanım Şartları",
    fPrivacy: "Gizlilik Politikası",
    fKvkk: "KVKK Aydınlatma",
    fCookies: "Çerez Politikası",
    fRefund: "İade & İptal",
    fRights: "Tüm hakları saklıdır.",
  },
  en: {
    navFeatures: "Features",
    navHow: "How It Works",
    navPricing: "Pricing",
    navLogin: "Sign In",
    navSignup: "Start Free",
    heroBadge: "The New Generation AI Digital Agency",
    heroT1: "Grow your business",
    heroGrad: "with AI",
    heroT2: "",
    heroDesc: "Build a website, train a chatbot, generate content, analyze reviews.",
    heroDescBold: "One panel, zero technical skills required.",
    heroCta: "Start 7-Day Free Trial",
    heroDemo: "Watch Demo",
    checks: ["7-day free trial", "No credit card required", "Cancel anytime", "Live support"],
    stats: ["Registered Businesses", "User Satisfaction", "Reviews Analyzed", "Saved vs Agency Costs"],
    featBadge: "All Tools in One Place",
    featT1: "Everything your business",
    featGrad: "needs to grow",
    featDesc: "Strengthen your digital presence with AI-powered tools. No technical skills needed.",
    stepsT1: "Start in",
    stepsGrad: "4 steps",
    trust: [
      { title: "SSL & Secure", desc: "All your data is stored encrypted." },
      { title: "Fast Setup", desc: "Set up in 10 minutes, start using right away." },
      { title: "Live Support", desc: "We're here whenever you need help." },
    ],
    ctaTitle: "Get started now",
    ctaDesc: "Try free for 7 days — no credit card required. Set up in minutes, cancel anytime.",
    ctaBtn: "Create Free Account",
    ctaLogin: "Sign In",
    fDesc: "AI-powered digital agency for your business: website, chatbot, content, menu and customer management in one platform.",
    fProduct: "Product",
    fCorp: "Company",
    fLegal: "Legal",
    fAbout: "About",
    fContact: "Contact",
    fFaq: "FAQ",
    fTerms: "Terms of Service",
    fPrivacy: "Privacy Policy",
    fKvkk: "KVKK Notice",
    fCookies: "Cookie Policy",
    fRefund: "Refund & Cancellation",
    fRights: "All rights reserved.",
  },
};

/* ── Dekoratif küre — referans tasarımdaki 3B küreye karşılık gelen,
      tamamen CSS/SVG ile üretilmiş katmanlı orb (harici görsel yok) ── */
function Orb({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none relative ${className}`} aria-hidden>
      {/* Yörünge halkaları — sürekli döner */}
      <svg viewBox="0 0 400 400" className="nv-orb-rings absolute inset-0 h-full w-full">
        <ellipse cx="200" cy="200" rx="188" ry="72" fill="none" stroke="#8b5cf6" strokeOpacity="0.45" strokeWidth="1.5" transform="rotate(-18 200 200)" />
        <ellipse cx="200" cy="200" rx="178" ry="98" fill="none" stroke="#94a3b8" strokeOpacity="0.35" strokeWidth="1.5" transform="rotate(24 200 200)" />
        <ellipse cx="200" cy="200" rx="194" ry="46" fill="none" stroke="#a855f7" strokeOpacity="0.35" strokeWidth="1.5" transform="rotate(6 200 200)" />
      </svg>

      {/* Küre gövdesi + üzerinde akan organik damarlar */}
      <div className="nv-orb-body absolute left-1/2 top-1/2 h-[64%] w-[64%] overflow-hidden rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 26%, #ede9fe 0%, #c4b5fd 16%, #8b5cf6 40%, #5b21b6 66%, #2e1065 100%)",
          boxShadow:
            "inset -20px -24px 64px rgba(20,10,50,0.8), inset 16px 18px 44px rgba(255,255,255,0.38), 0 44px 96px -32px rgba(109,40,217,0.6)",
        }}
      >
        {/* Yüzeyde dolanan bantlar — küreye hacim/organik doku verir */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-70">
          <defs>
            <linearGradient id="nv-band" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#e9d5ff" stopOpacity="0.85" />
              <stop offset="0.5" stopColor="#a78bfa" stopOpacity="0.45" />
              <stop offset="1" stopColor="#4c1d95" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M-10 118 C 40 78, 92 150, 210 96" fill="none" stroke="url(#nv-band)" strokeWidth="17" strokeLinecap="round" />
          <path d="M-10 72 C 52 118, 118 44, 210 76" fill="none" stroke="url(#nv-band)" strokeWidth="11" strokeLinecap="round" opacity="0.7" />
          <path d="M-10 156 C 56 128, 130 186, 210 140" fill="none" stroke="url(#nv-band)" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
        </svg>
        {/* Üstten parlama */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 30% 22%, rgba(255,255,255,0.6) 0%, transparent 40%)" }} />
      </div>
    </div>
  );
}

/* Sıralı başlık animasyonu: satır yukarıdan düşer → vurgu hapı uzar →
   içindeki yazı harf harf yandan gelir → açıklama yukarıdan düşer. */
function SeqHeading({ pre, pill, desc }: { pre: string; pill: string; desc: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const PILL_START = 620;
  const LETTER_START = 980;
  const DESC_START = 1750;

  return (
    <div ref={ref}>
      <h2 className="nv-display mx-auto max-w-4xl text-center text-4xl sm:text-6xl">
        <span className={`inline-block ${on ? "nv-drop" : "opacity-0"}`}>{pre}</span>{" "}
        <span
          className={`relative inline-block rounded-full bg-violet-500 px-5 pb-1.5 pt-0.5 text-neutral-950 ${on ? "nv-expand" : "opacity-0"}`}
          style={on ? { animationDelay: `${PILL_START}ms` } : undefined}
        >
          {pill.split("").map((ch, i) => (
            <span
              key={i}
              className={`inline-block ${on ? "nv-letter" : "opacity-0"}`}
              style={on ? { animationDelay: `${LETTER_START + i * 34}ms` } : undefined}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </span>
      </h2>
      <p
        className={`mx-auto mt-6 max-w-xl text-center text-[15px] leading-relaxed text-neutral-400 ${on ? "nv-drop" : "opacity-0"}`}
        style={on ? { animationDelay: `${DESC_START}ms` } : undefined}
      >
        {desc}
      </p>
    </div>
  );
}

/* Görünür olunca kademeli giriş — referans videodaki kart kaskadı */
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${shown ? "nv-rise" : "opacity-0"}`}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/* Noktalı ayraç */
function Dotted({ className = "" }: { className?: string }) {
  return <div className={`border-t border-dashed border-current opacity-25 ${className}`} />;
}

export default function AnaSayfa() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang } = useLang();
  const s = L[lang];
  const feats = lang === "en" ? FEATURES.map((f, i) => ({ ...f, ...FEATURES_EN[i] })) : FEATURES;
  const steps = lang === "en" ? STEPS.map((st, i) => ({ ...st, ...STEPS_EN[i] })) : STEPS;

  const navLinks = (
    <>
      <a href="#ozellikler" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--mk-ink-soft)] transition hover:bg-[var(--mk-chip)] hover:text-[var(--mk-ink)]">{s.navFeatures}</a>
      <a href="#nasil-calisir" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--mk-ink-soft)] transition hover:bg-[var(--mk-chip)] hover:text-[var(--mk-ink)]">{s.navHow}</a>
      <Link href="/fiyatlar" className="rounded-full px-4 py-2 text-sm font-medium text-[var(--mk-ink-soft)] transition hover:bg-[var(--mk-chip)] hover:text-[var(--mk-ink)]">{s.navPricing}</Link>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--mk-bg)] text-[var(--mk-ink)] selection:bg-violet-300/60">
      <div className="mx-auto max-w-[1400px] px-3 pb-3 sm:px-4 sm:pb-4">

        {/* ══ HERO — beyaz üst kart (nav + dev wordmark) + açık gri alt alan ══ */}
        <section className="relative overflow-hidden rounded-[28px] bg-[var(--mk-surface)] shadow-[0_30px_80px_-40px_rgba(20,20,40,0.35)] sm:rounded-[36px]">

          {/* Nav */}
          <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-7 sm:pt-6">
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <LogoMark size={30} />
              <span className="text-[15px] font-bold tracking-tight">Novelya</span>
            </Link>

            {/* kapsül menü */}
            <div className="hidden items-center rounded-full bg-[var(--mk-chip)] p-1 md:flex">{navLinks}</div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/giris" className="hidden text-sm font-medium text-[var(--mk-ink-soft)] transition hover:text-[var(--mk-ink)] sm:block">{s.navLogin}</Link>
              <Link href="/kayit" className="group hidden items-center gap-2 rounded-full bg-[var(--mk-btn)] px-5 py-2.5 text-sm font-semibold text-[var(--mk-btn-ink)] transition hover:opacity-90 sm:inline-flex">
                {s.navSignup}
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menü"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--mk-chip)] text-[var(--mk-ink-soft)] md:hidden">
                {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="mx-4 mt-4 flex flex-col gap-1 rounded-2xl bg-[var(--mk-chip)] p-2 md:hidden">
              {navLinks}
              <Link href="/kayit" onClick={() => setMenuOpen(false)}
                className="mt-1 rounded-full bg-[var(--mk-btn)] py-2.5 text-center text-sm font-semibold text-[var(--mk-btn-ink)]">{s.navSignup}</Link>
            </div>
          )}

          {/* Dev wordmark */}
          <h1 className="px-3 pt-6 text-center text-[clamp(3rem,14.5vw,11.5rem)] font-extrabold leading-[0.98] tracking-[-0.035em] text-[var(--mk-ink)] sm:pt-8">
            NOVELYA<span className="text-violet-600">.</span>
          </h1>

          {/* Alt alan: küre yazının üstüne biner, meta bilgiler kürenin iki yanında */}
          <div className="relative bg-gradient-to-b from-[var(--mk-surface)] via-[var(--mk-surface)] to-[var(--mk-bg)] px-4 pb-8 sm:px-8">
            {/* Küre — negatif üst boşlukla wordmark'a bindirilir (referanstaki gibi) */}
            <Orb className="pointer-events-none mx-auto -mt-[16%] h-[300px] w-[300px] sm:-mt-[14%] sm:h-[420px] sm:w-[420px] lg:-mt-[12%] lg:h-[500px] lg:w-[500px]" />

            {/* Kürenin iki yanı: sol sosyal kanıt / sağ numaralı indeks */}
            <div className="pointer-events-none absolute inset-x-0 top-[16%] hidden items-start justify-between px-8 lg:flex xl:px-12">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["#8b5cf6", "#6366f1", "#a855f7"].map((c) => (
                    <span key={c} className="h-8 w-8 rounded-full border-2 border-[var(--mk-surface)]" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <p className="text-xl font-bold leading-none">120+</p>
                  <p className="mt-1 text-xs text-[var(--mk-ink-soft)]">{s.stats[0]}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-right">
                {s.checks.slice(0, 3).map((c, i) => (
                  <p key={c} className="text-[13px] text-[var(--mk-ink-soft)]">
                    {c} <span className="nv-index ml-1.5 text-[var(--mk-ink-mute)]">/0{i + 1}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Alt sıra: sol açıklama / sağ dairesel CTA — küreyle aynı hizada */}
            <div className="relative -mt-[14%] flex flex-col items-center gap-8 sm:-mt-[12%] lg:-mt-[10%] lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[280px] text-center lg:text-left">
                <p className="text-[15px] leading-snug text-[var(--mk-ink-soft)]">{s.heroDesc}</p>
                <p className="mt-1 text-[15px] font-semibold leading-snug">{s.heroDescBold}</p>
                <Dotted className="mt-3 text-[var(--mk-ink-soft)]" />
              </div>

              <Link href="/kayit"
                className="group relative grid h-[132px] w-[132px] shrink-0 place-items-center">
                <span className="nv-orb-rings absolute inset-0 rounded-full border-2 border-dashed border-violet-400/50" />
                <span className="absolute inset-[9px] rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-[0_22px_50px_-16px_rgba(109,40,217,0.85)] transition duration-300 group-hover:scale-[1.06]" />
                <span className="relative z-10 flex flex-col items-center gap-1.5 px-4 text-center leading-tight text-white">
                  <span className="text-[13px] font-extrabold">{s.heroCta}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition group-hover:translate-x-0.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ GÜVEN ŞERİDİ — hero'nun hemen altında, numaralı ve ayraçlı ══ */}
        <section className="mt-3 overflow-hidden rounded-[24px] bg-[var(--mk-surface)] sm:mt-4 sm:rounded-[28px]">
          <div className="grid divide-y divide-dashed divide-[var(--mk-line)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-dashed">
            {s.checks.map((c, i) => (
              <Reveal key={c} delay={i * 90}>
                <div className="flex items-center gap-3 px-6 py-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/12 text-violet-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-semibold leading-snug">{c}</span>
                  <span className="nv-index text-[var(--mk-ink-mute)]">/0{i + 1}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══ GÜVEN — başlık + beyaz kart ══ */}
        <section className="mt-3 sm:mt-4">
          <h2 className="nv-display px-2 pb-4 pt-6 text-4xl sm:text-5xl">{s.featBadge}<span className="text-violet-600">.</span></h2>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-[var(--mk-line)] sm:rounded-[28px] lg:grid-cols-4">
            {s.stats.map((label, i) => (
              <Reveal key={label} delay={i * 90} className="bg-[var(--mk-surface)]">
              <div className="px-5 py-7 text-center">
                <p className="text-3xl font-black tracking-tight sm:text-4xl">{["120+", "4.8★", "8.500+", "%90"][i]}</p>
                <p className="mt-1.5 text-xs text-[var(--mk-ink-soft)]">{label}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══ ÖZELLİKLER — siyah bölüm ══ */}
        <section id="ozellikler" className="mt-3 rounded-[28px] bg-[var(--mk-invert)] px-5 py-14 text-white sm:mt-4 sm:rounded-[36px] sm:px-10 sm:py-20">
          <SeqHeading pre={s.featT1} pill={s.featGrad} desc={s.featDesc} />

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {feats.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 110}
                className={["lg:mt-0", "lg:mt-8", "lg:mt-16"][i % 3]}
              >
              <div
                className="group h-full rounded-[22px] bg-[var(--mk-btn)] p-6 transition duration-300 hover:-translate-y-1 hover:opacity-90/90">
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition group-hover:scale-110"
                    style={{ color: f.accent }}>
                    <f.icon className="h-5 w-5" />
                  </span>
                  <span className="nv-index text-white/25">/{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-lg font-bold leading-snug">{f.title}</h3>
                <Dotted className="my-3 text-white" />
                <p className="text-sm leading-relaxed text-[var(--mk-ink-mute)]">{f.desc}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══ ADIMLAR ══ */}
        <section id="nasil-calisir" className="mt-3 sm:mt-4">
          <h2 className="nv-display px-2 pb-4 pt-6 text-4xl sm:text-5xl">
            {s.stepsT1} <span className="text-violet-600">{s.stepsGrad}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((st, i) => (
              <Reveal key={st.num} delay={i * 110}>
              <div className="h-full rounded-[22px] bg-[var(--mk-surface)] p-6">
                <span className="nv-display block text-5xl text-violet-600">{st.num}</span>
                <Dotted className="my-4 text-[var(--mk-ink-soft)]" />
                <h3 className="text-base font-bold">{st.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--mk-ink-soft)]">{st.desc}</p>
              </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══ CTA — siyah ══ */}
        <section className="mt-3 overflow-hidden rounded-[28px] bg-[var(--mk-invert)] px-6 py-16 text-center text-white sm:mt-4 sm:rounded-[36px] sm:py-24">
          <h2 className="nv-display mx-auto max-w-3xl text-4xl sm:text-6xl">{s.ctaTitle}<span className="text-violet-500">.</span></h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--mk-ink-mute)]">{s.ctaDesc}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/kayit" className="group inline-flex items-center gap-2 rounded-full bg-violet-600 px-8 py-4 text-base font-bold transition hover:bg-violet-500">
              {s.ctaBtn}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/giris" className="rounded-full border border-white/15 px-8 py-4 text-base font-semibold text-neutral-200 transition hover:bg-white/[0.06]">
              {s.ctaLogin}
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {s.checks.map((c, i) => (
              <span key={c} className="text-sm text-[var(--mk-ink-soft)]">
                {c} <span className="nv-index ml-1 text-white/20">/0{i + 1}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="mt-3 rounded-[28px] bg-[var(--mk-surface)] px-6 py-12 sm:mt-4 sm:rounded-[36px] sm:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <LogoMark size={30} />
                <span className="text-[15px] font-bold tracking-tight">Novelya</span>
              </div>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--mk-ink-soft)]">{s.fDesc}</p>
            </div>
            {[
              { t: s.fProduct, links: [[s.navFeatures, "#ozellikler"], [s.navPricing, "/fiyatlar"], [s.navHow, "#nasil-calisir"]] },
              { t: s.fCorp, links: [[s.fAbout, "/hakkimizda"], [s.fContact, "/iletisim"], [s.fFaq, "/sss"]] },
              { t: s.fLegal, links: [[s.fTerms, "/kullanim-sartlari"], [s.fPrivacy, "/gizlilik"], [s.fKvkk, "/kvkk"], [s.fCookies, "/cerez-politikasi"], [s.fRefund, "/iade-politikasi"]] },
            ].map((col) => (
              <div key={col.t}>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--mk-ink-mute)]">{col.t}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-sm text-[var(--mk-ink-soft)] transition hover:text-violet-600">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Dotted className="my-8 text-[var(--mk-ink-soft)]" />
          <div className="mb-6 flex justify-center"><PublicControls /></div>
          <p className="text-center text-xs text-[var(--mk-ink-mute)]">
            © {new Date().getFullYear()} Novelya. {s.fRights}
          </p>
        </footer>
      </div>
    </div>
  );
}
