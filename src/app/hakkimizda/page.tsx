import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, Target, Heart, ShieldCheck, Sparkles, Users, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Hakkımızda | Novelya",
  description: "Novelya; küçük ve orta ölçekli işletmelerin dijital varlığını yapay zeka ile güçlendiren tek platform.",
};

const VALUES = [
  { icon: Target, title: "İşletme Odaklı", desc: "Her özelliği, gerçek işletmelerin gerçek sorunlarını çözmek için tasarlıyoruz." },
  { icon: Sparkles, title: "Yapay Zeka Gücü", desc: "En güncel yapay zeka modelleriyle içerik, chatbot ve website üretimini otomatikleştiriyoruz." },
  { icon: ShieldCheck, title: "Güven & Güvenlik", desc: "Verileriniz şifrelenir, gizliliğiniz KVKK’ya uygun biçimde korunur." },
  { icon: Heart, title: "Sade & Erişilebilir", desc: "Teknik bilgi gerektirmeden, dakikalar içinde kullanılabilen bir deneyim." },
];

const STATS = [
  { value: "7/24", label: "Kesintisiz hizmet" },
  { value: "10+", label: "Entegre araç" },
  { value: "3+", label: "Yıldır geliştiriliyor" },
  { value: "%100", label: "Yerli ve KVKK uyumlu" },
];

export default function HakkimizdaPage() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
            <Rocket className="h-3.5 w-3.5" /> Hikayemiz
          </span>
          <h1 className="mt-5 text-4xl font-black leading-tight text-white sm:text-5xl">
            İşletmelerin dijital <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">ajansı</span>, tek platformda
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            Novelya; kafeler, restoranlar, mağazalar ve hizmet işletmeleri için
            website, chatbot, içerik üretimi, dijital menü ve müşteri yönetimini yapay zeka
            ile birleştiren bir dijital ajans platformudur. Amacımız, pahalı ajanslara
            ihtiyaç duymadan her işletmenin profesyonel bir dijital varlığa kavuşmasını
            sağlamak.
          </p>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="px-6 pb-8">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 text-center">
              <p className="text-2xl font-black text-white sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Misyon */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-[0_0_50px_-12px_rgba(139,92,246,0.5)]">
            <Target className="h-8 w-8" />
            <h2 className="mt-4 text-2xl font-bold">Misyonumuz</h2>
            <p className="mt-3 leading-relaxed text-violet-100">
              Her ölçekten işletmenin, teknik bilgi ya da büyük bütçe gerektirmeden
              dijitalde güçlü, profesyonel ve rekabetçi olmasını sağlamak.
            </p>
          </div>
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-8">
            <Rocket className="h-8 w-8 text-violet-400" />
            <h2 className="mt-4 text-2xl font-bold text-white">Vizyonumuz</h2>
            <p className="mt-3 leading-relaxed text-slate-400">
              Türkiye’de küçük ve orta ölçekli işletmelerin ilk tercih ettiği,
              yapay zeka destekli dijital büyüme platformu olmak.
            </p>
          </div>
        </div>
      </section>

      {/* Değerler */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-white">Değerlerimiz</h2>
            <p className="mt-3 text-slate-500">Her kararımızın arkasındaki ilkeler</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-white/[0.05]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                  <v.icon className="h-6 w-6 text-violet-300" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{v.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-violet-400/20 bg-gradient-to-br from-[#12102a] to-[#0c0a1e] p-10 text-center sm:p-14">
          <Users className="mx-auto h-10 w-10 text-violet-300" />
          <h2 className="mt-4 text-3xl font-black text-white">İşletmenizi dijitale taşıyalım</h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            Hemen başlayın. İstediğiniz zaman iptal edin.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/kayit" className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 font-bold text-white shadow-[0_0_40px_-8px_rgba(139,92,246,0.6)] transition hover:-translate-y-0.5">
              Ücretsiz Başla <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="/iletisim" className="rounded-2xl border border-white/15 px-8 py-4 font-semibold text-white transition hover:bg-white/[0.06]">
              Bize Ulaşın
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
