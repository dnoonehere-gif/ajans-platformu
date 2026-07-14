import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { Sparkles, Bot, Star, Globe, TrendingUp } from "lucide-react";
import Lightfall from "@/components/reactbits/lightfall";

export const metadata: Metadata = { title: "Giriş — Novelya" };

const FEATURES = [
  { icon: Bot, text: "AI chatbot ile 7/24 müşteri desteği ve rezervasyon" },
  { icon: Star, text: "Google yorumlarını takip edin, AI ile yanıtlayın" },
  { icon: Globe, text: "Dakikalar içinde web sitenizi yayına alın" },
  { icon: TrendingUp, text: "CRM, e-posta pazarlama ve raporlar tek panelde" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen bg-[#1a0b2e]">
      {/* Tam ekran Lightfall arka planı */}
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
          dpr={0.75}
        />
      </div>

      {/* Sol panel — marka */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <LogoMark size={40} />
          <span className="text-xl font-bold tracking-tight text-white">Novelya</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            AI destekli işletme platformu
          </div>
          <h2 className="mb-4 text-4xl font-bold leading-tight text-white">
            İşletmenizi dijitalde<br />büyütmenin en kolay yolu
          </h2>
          <p className="mb-8 text-white/70">
            Website, chatbot, yorum yönetimi, CRM ve pazarlama araçları — hepsi tek platformda.
          </p>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-white/85">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/50">
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
