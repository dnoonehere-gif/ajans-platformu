import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import {
  Sparkles, Bot, Star, Globe, TrendingUp, Mail, QrCode,
  ShieldCheck, Zap, Layers, CalendarCheck, UserPlus, Send,
  Search, FileBarChart, UtensilsCrossed, MapPin, Building2,
  Users, BarChart3,
} from "lucide-react";

export const metadata: Metadata = { title: "Giriş — Novelya" };

const FEATURES = [
  { icon: Globe, label: "AI Website Builder", color: "text-violet-300" },
  { icon: Bot, label: "AI Chatbot", color: "text-sky-300" },
  { icon: CalendarCheck, label: "Chatbot ile Rezervasyon", color: "text-cyan-300" },
  { icon: Sparkles, label: "AI İçerik Üreticisi", color: "text-fuchsia-300" },
  { icon: BarChart3, label: "AI Dashboard & Analiz", color: "text-emerald-300" },
  { icon: Star, label: "Yorum Analizi & AI Yanıt", color: "text-amber-300" },
  { icon: MapPin, label: "Google Business Entegrasyonu", color: "text-red-300" },
  { icon: QrCode, label: "QR Geri Bildirim", color: "text-orange-300" },
  { icon: UtensilsCrossed, label: "Dijital QR Menü", color: "text-rose-300" },
  { icon: UserPlus, label: "CRM & Satış Pipeline", color: "text-indigo-300" },
  { icon: Mail, label: "E-posta Pazarlama", color: "text-yellow-300" },
  { icon: Send, label: "Sosyal Medya Planlayıcı", color: "text-pink-300" },
  { icon: Search, label: "SEO Araçları", color: "text-green-300" },
  { icon: FileBarChart, label: "Müşteri Raporları (PDF)", color: "text-purple-300" },
  { icon: Building2, label: "Şube Yönetimi", color: "text-teal-300" },
  { icon: Users, label: "Takım & Rol Yetkileri", color: "text-blue-300" },
];

const STATS = [
  { icon: Layers, value: "16+", label: "Modül" },
  { icon: Zap, value: "5 dk", label: "Kurulum" },
  { icon: ShieldCheck, value: "7/24", label: "AI Destek" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800">
      {/* Novelya temalı dekoratif arka plan — hafif, CSS-only */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[34rem] w-[34rem] rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-300/10 blur-3xl" />
        {/* İnce nokta deseni */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
      </div>

      {/* Sol panel — marka & özellikler */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between overflow-hidden p-10 xl:p-12 lg:flex">
        <Link href="/" className="nv-enter flex items-center gap-3">
          <LogoMark size={40} />
          <span className="text-xl font-bold tracking-tight text-white">Novelya</span>
        </Link>

        <div className="max-w-xl">
          <div className="nv-enter nv-enter-1 mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
            AI destekli işletme platformu
          </div>

          <h2 className="nv-enter nv-enter-2 mb-2 text-3xl font-bold leading-tight text-white xl:text-4xl">
            İşletmenizi dijitalde<br />büyütmenin en kolay yolu
          </h2>
          <p className="nv-enter nv-enter-3 mb-6 text-sm text-white/70">
            Tek panelden yönetin: website, chatbot, yorumlar, CRM, pazarlama ve daha fazlası.
          </p>

          {/* Tüm özellikler */}
          <div className="nv-enter nv-enter-4 mb-6 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {FEATURES.map(({ icon: Icon, label, color }) => (
              <div key={label} className="group flex items-center gap-2.5 text-sm text-white/85 transition hover:text-white">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-transform duration-200 group-hover:scale-110">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <span className="leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* İstatistik şeridi */}
          <div className="nv-enter nv-enter-5 flex items-center gap-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
                <Icon className="h-4 w-4 shrink-0 text-violet-200" />
                <div>
                  <p className="text-base font-bold leading-none text-white">{value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="nv-enter nv-enter-6 text-xs text-white/50">
          © {new Date().getFullYear()} Novelya —{" "}
          <a href="https://www.novelya.com.tr" className="underline-offset-2 transition hover:text-white hover:underline">
            novelya.com.tr
          </a>
        </p>
      </div>

      {/* Sağ panel — form kartı */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobil logo */}
          <div className="mb-6 text-center lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center gap-2">
              <LogoMark size={44} />
              <span className="text-lg font-bold tracking-tight text-white">Novelya</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
