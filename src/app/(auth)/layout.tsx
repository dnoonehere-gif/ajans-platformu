import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import {
  Sparkles, Bot, Star, Globe, TrendingUp, CalendarCheck, Mail,
  QrCode, ShieldCheck, Zap, Layers,
} from "lucide-react";
import Lightfall from "@/components/reactbits/lightfall";

export const metadata: Metadata = { title: "Giriş — Novelya" };

const FEATURES = [
  { icon: Bot, title: "AI Chatbot & Rezervasyon", desc: "7/24 müşteri desteği, konuşarak rezervasyon alma", color: "text-sky-300", bg: "bg-sky-400/15" },
  { icon: Star, title: "Yorum Yönetimi", desc: "Google yorumlarını çekin, AI yanıt önerileri alın", color: "text-amber-300", bg: "bg-amber-400/15" },
  { icon: Globe, title: "Website Builder", desc: "Dakikalar içinde profesyonel siteniz yayında", color: "text-emerald-300", bg: "bg-emerald-400/15" },
  { icon: TrendingUp, title: "CRM & Pipeline", desc: "Müşteri adaylarını aşama aşama takip edin", color: "text-violet-300", bg: "bg-violet-400/15" },
  { icon: Mail, title: "E-posta Pazarlama", desc: "Toplu kampanyalar, açılma oranı takibi", color: "text-rose-300", bg: "bg-rose-400/15" },
  { icon: QrCode, title: "QR Menü & Geri Bildirim", desc: "Dijital menü ve müşteri geri bildirimi tek QR'da", color: "text-orange-300", bg: "bg-orange-400/15" },
];

const STATS = [
  { icon: Layers, value: "15+", label: "Modül" },
  { icon: Zap, value: "5 dk", label: "Kurulum" },
  { icon: ShieldCheck, value: "7/24", label: "AI Destek" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-[#1a0b2e]">
      {/* Tam ekran Lightfall arka planı — statik kare (paused), GPU yükü yok */}
      <div className="absolute inset-0">
        <Lightfall
          colors={["#a78bfa", "#7c3aed", "#e879f9"]}
          backgroundColor="#6d28d9"
          speed={1}
          streakCount={4}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.8}
          twinkle={1}
          zoom={2}
          backgroundGlow={1}
          opacity={1}
          mouseInteraction={false}
          paused={true}
          dpr={0.75}
        />
        {/* Okunabilirlik için hafif karartma */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
      </div>

      {/* Sol panel — marka */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        <Link href="/" className="nv-enter flex items-center gap-3">
          <LogoMark size={40} />
          <span className="text-xl font-bold tracking-tight text-white">Novelya</span>
        </Link>

        <div className="max-w-lg">
          <div className="nv-enter nv-enter-1 mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" />
            AI destekli işletme platformu
          </div>

          <h2 className="nv-enter nv-enter-2 mb-3 text-4xl font-bold leading-tight text-white">
            İşletmenizi dijitalde<br />büyütmenin en kolay yolu
          </h2>
          <p className="nv-enter nv-enter-3 mb-8 text-white/70">
            Website, chatbot, yorum yönetimi, CRM ve pazarlama araçları — hepsi tek platformda.
          </p>

          {/* Özellik kartları */}
          <div className="nv-enter nv-enter-4 mb-8 grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.1]"
              >
                <div className={`mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl ${bg} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`h-[18px] w-[18px] ${color}`} />
                </div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/60">{desc}</p>
              </div>
            ))}
          </div>

          {/* İstatistik şeridi */}
          <div className="nv-enter nv-enter-5 flex items-center gap-3">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
                <Icon className="h-4 w-4 shrink-0 text-violet-300" />
                <div>
                  <p className="text-base font-bold leading-none text-white">{value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="nv-enter nv-enter-6 text-xs text-white/50">
          © {new Date().getFullYear()} Novelya — novelya.com.tr
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
