"use client";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import {
  Sparkles, Bot, Star, Globe, Mail, QrCode,
  ShieldCheck, Zap, Layers, CalendarCheck, UserPlus, Send,
  Search, FileBarChart, UtensilsCrossed, MapPin, Building2,
  Users, BarChart3,
} from "lucide-react";
import { useLang, LanguageSwitcher } from "@/components/language-provider";

const FEATURES = [
  { icon: Globe, tr: "AI Website Builder", en: "AI Website Builder", color: "text-violet-300" },
  { icon: Bot, tr: "AI Chatbot", en: "AI Chatbot", color: "text-sky-300" },
  { icon: CalendarCheck, tr: "Chatbot ile Rezervasyon", en: "Chatbot Reservations", color: "text-cyan-300" },
  { icon: Sparkles, tr: "AI İçerik Üreticisi", en: "AI Content Generator", color: "text-fuchsia-300" },
  { icon: BarChart3, tr: "AI Dashboard & Analiz", en: "AI Dashboard & Analytics", color: "text-emerald-300" },
  { icon: Star, tr: "Yorum Analizi & AI Yanıt", en: "Review Analysis & AI Replies", color: "text-amber-300" },
  { icon: MapPin, tr: "Google Business Entegrasyonu", en: "Google Business Integration", color: "text-red-300" },
  { icon: QrCode, tr: "QR Geri Bildirim", en: "QR Feedback", color: "text-orange-300" },
  { icon: UtensilsCrossed, tr: "Dijital QR Menü", en: "Digital QR Menu", color: "text-rose-300" },
  { icon: UserPlus, tr: "CRM & Satış Pipeline", en: "CRM & Sales Pipeline", color: "text-indigo-300" },
  { icon: Mail, tr: "E-posta Pazarlama", en: "Email Marketing", color: "text-yellow-300" },
  { icon: Send, tr: "Sosyal Medya Planlayıcı", en: "Social Media Planner", color: "text-pink-300" },
  { icon: Search, tr: "SEO Araçları", en: "SEO Tools", color: "text-green-300" },
  { icon: FileBarChart, tr: "Müşteri Raporları (PDF)", en: "Client Reports (PDF)", color: "text-purple-300" },
  { icon: Building2, tr: "Şube Yönetimi", en: "Branch Management", color: "text-teal-300" },
  { icon: Users, tr: "Takım & Rol Yetkileri", en: "Team & Role Permissions", color: "text-blue-300" },
];

const L = {
  tr: {
    badge: "AI destekli işletme platformu",
    title1: "İşletmenizi dijitalde",
    title2: "büyütmenin en kolay yolu",
    desc: "Tek panelden yönetin: website, chatbot, yorumlar, CRM, pazarlama ve daha fazlası.",
    stats: [
      { value: "16+", label: "Modül" },
      { value: "5 dk", label: "Kurulum" },
      { value: "7/24", label: "AI Destek" },
    ],
  },
  en: {
    badge: "AI-powered business platform",
    title1: "The easiest way to grow",
    title2: "your business online",
    desc: "Manage everything from one panel: website, chatbot, reviews, CRM, marketing and more.",
    stats: [
      { value: "16+", label: "Modules" },
      { value: "5 min", label: "Setup" },
      { value: "24/7", label: "AI Support" },
    ],
  },
};

const STAT_ICONS = [Layers, Zap, ShieldCheck];

export function AuthPanel() {
  const { lang } = useLang();
  const s = L[lang];

  return (
    <div className="relative z-10 hidden w-1/2 flex-col justify-between overflow-hidden p-10 xl:p-12 lg:flex">
      <div className="flex items-center justify-between">
        <Link href="/" className="nv-enter flex items-center gap-3">
          <LogoMark size={40} />
          <span className="text-xl font-bold tracking-tight text-white">Novelya</span>
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="max-w-xl">
        <div className="nv-enter nv-enter-1 mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
          {s.badge}
        </div>

        <h2 className="nv-enter nv-enter-2 mb-2 text-3xl font-bold leading-tight text-white xl:text-4xl">
          {s.title1}<br />{s.title2}
        </h2>
        <p className="nv-enter nv-enter-3 mb-6 text-sm text-white/70">{s.desc}</p>

        <div className="nv-enter nv-enter-4 mb-6 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {FEATURES.map(({ icon: Icon, tr, en, color }) => (
            <div key={tr} className="group flex items-center gap-2.5 text-sm text-white/85 transition hover:text-white">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-transform duration-200 group-hover:scale-110">
                <Icon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              <span className="leading-tight">{lang === "en" ? en : tr}</span>
            </div>
          ))}
        </div>

        <div className="nv-enter nv-enter-5 flex items-center gap-3">
          {s.stats.map(({ value, label }, i) => {
            const Icon = STAT_ICONS[i];
            return (
              <div key={label} className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
                <Icon className="h-4 w-4 shrink-0 text-violet-200" />
                <div>
                  <p className="text-base font-bold leading-none text-white">{value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="nv-enter nv-enter-6 text-xs text-white/50">
        © {new Date().getFullYear()} Novelya —{" "}
        <a href="https://www.novelya.com.tr" className="underline-offset-2 transition hover:text-white hover:underline">
          novelya.com.tr
        </a>
      </p>
    </div>
  );
}
