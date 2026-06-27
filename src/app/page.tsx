"use client";
// Kurumsal web sitesi - Ana sayfa (premium, glassmorphism)
import { motion } from "framer-motion";
import { Sparkles, Bot, BarChart3, QrCode, Globe, MessageSquare } from "lucide-react";

const ozellikler = [
  { ikon: Globe, baslik: "AI Web Sitesi Kurucu", aciklama: "Birkaç bilgiyle dakikalar içinde kurumsal site." },
  { ikon: Bot, baslik: "AI Chatbot", aciklama: "Markanıza özel eğitilmiş akıllı asistan." },
  { ikon: Sparkles, baslik: "AI İçerik Üreticisi", aciklama: "Instagram, blog, reklam metinleri ve 30 günlük plan." },
  { ikon: BarChart3, baslik: "AI Dashboard", aciklama: "Günlük otomatik performans özeti ve öneriler." },
  { ikon: QrCode, baslik: "QR Geri Bildirim", aciklama: "Müşteri yorumlarını topla, yapay zekâ ile analiz et." },
  { ikon: MessageSquare, baslik: "Yorum Analizi", aciklama: "Memnuniyet, şikâyet ve iyileştirme önerileri." },
];

export default function AnaSayfa() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-28 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.18),transparent)]" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-5xl font-bold tracking-tight md:text-6xl"
        >
          İşletmeniz için <span className="text-[hsl(var(--primary))]">yapay zekâ destekli</span> dijital ajans
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-6 max-w-xl text-lg text-[hsl(var(--muted-foreground))]"
        >
          Web sitenizi kurun, içeriğinizi üretin, yorumlarınızı analiz edin — hepsi tek panelden, tamamen Türkçe.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex justify-center gap-4"
        >
          <a href="/kayit" className="rounded-xl bg-[hsl(var(--primary))] px-6 py-3 font-medium text-[hsl(var(--primary-foreground))]">
            Ücretsiz Başla
          </a>
          <a href="/giris" className="glass rounded-xl px-6 py-3 font-medium">Giriş Yap</a>
        </motion.div>
      </section>

      {/* Özellikler */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 pb-28 md:grid-cols-3">
        {ozellikler.map((o, i) => (
          <motion.div
            key={o.baslik}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="glass rounded-2xl p-6"
          >
            <o.ikon className="mb-4 h-7 w-7 text-[hsl(var(--primary))]" />
            <h3 className="text-lg font-semibold">{o.baslik}</h3>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{o.aciklama}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
