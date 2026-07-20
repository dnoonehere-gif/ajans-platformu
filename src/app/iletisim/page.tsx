"use client";
import { useState } from "react";
import { Mail, MessageSquare, Clock, Send, Loader2, CheckCircle2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    badge: "İletişim", title: "Bize ulaşın",
    subtitle: "Sorularınız, önerileriniz veya iş birliği talepleriniz için formu doldurun; en kısa sürede size dönüş yapalım.",
    cEmail: "E-posta", cTime: "Yanıt Süresi", cTimeVal: "Genellikle 24 saat içinde",
    cSupport: "Destek", cSupportVal: "Hesabınızdan canlı destek",
    fastTitle: "Hızlı yanıt mı arıyorsunuz?",
    fastDesc: "Sık sorulan soruların çoğunun cevabı SSS sayfamızda.",
    fastBtn: "SSS’ye Git",
    sentTitle: "Mesajınız iletildi!",
    sentDesc: "Teşekkürler. En kısa sürede belirttiğiniz e-posta adresinden dönüş yapacağız.",
    sentBtn: "Yeni Mesaj Gönder",
    fName: "Ad Soyad", fNamePh: "Adınız",
    fEmail: "E-posta", fEmailPh: "ornek@mail.com",
    fSubject: "Konu", fSubjectPh: "Mesajınızın konusu",
    fMessage: "Mesaj", fMessagePh: "Bize nasıl yardımcı olabiliriz?",
    sending: "Gönderiliyor...", send: "Mesajı Gönder",
    genericError: "Bir hata oluştu.", connError: "Bağlantı hatası. Lütfen tekrar deneyin.",
  },
  en: {
    badge: "Contact", title: "Get in touch",
    subtitle: "Fill in the form for your questions, suggestions or partnership requests and we will get back to you as soon as possible.",
    cEmail: "Email", cTime: "Response Time", cTimeVal: "Usually within 24 hours",
    cSupport: "Support", cSupportVal: "Live support from your account",
    fastTitle: "Looking for a quick answer?",
    fastDesc: "Most frequently asked questions are answered on our FAQ page.",
    fastBtn: "Go to FAQ",
    sentTitle: "Your message has been sent!",
    sentDesc: "Thank you. We will get back to you at the email address you provided as soon as possible.",
    sentBtn: "Send Another Message",
    fName: "Full Name", fNamePh: "Your name",
    fEmail: "Email", fEmailPh: "you@example.com",
    fSubject: "Subject", fSubjectPh: "Subject of your message",
    fMessage: "Message", fMessagePh: "How can we help you?",
    sending: "Sending...", send: "Send Message",
    genericError: "Something went wrong.", connError: "Connection error. Please try again.",
  },
};

const inp = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-600";

export default function IletisimPage() {
  const { lang } = useLang();
  const sL = L[lang];
  const CONTACT = [
    { icon: Mail, title: sL.cEmail, value: "novelya@novelya.com.tr", href: "mailto:novelya@novelya.com.tr" },
    { icon: Clock, title: sL.cTime, value: sL.cTimeVal },
    { icon: MessageSquare, title: sL.cSupport, value: sL.cSupportVal },
  ];
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? sL.genericError); setStatus("error"); return; }
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError(sL.connError);
      setStatus("error");
    }
  }

  return (
    <PageShell>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-300">
            <MessageSquare className="h-3.5 w-3.5" /> {sL.badge}
          </span>
          <h1 className="mt-5 text-4xl font-black text-white sm:text-5xl">{sL.title}</h1>
          <p className="mt-4 text-lg text-slate-400">
            {sL.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-5">
          {/* İletişim bilgileri */}
          <div className="space-y-4 lg:col-span-2">
            {CONTACT.map((c) => (
              <div key={c.title} className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10">
                  <c.icon className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{c.title}</p>
                  {c.href ? (
                    <a href={c.href} className="mt-0.5 block text-sm text-violet-400 hover:underline">{c.value}</a>
                  ) : (
                    <p className="mt-0.5 text-sm text-slate-400">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-[0_0_40px_-12px_rgba(139,92,246,0.5)]">
              <HelpCircle className="h-6 w-6" />
              <p className="mt-3 font-bold">{sL.fastTitle}</p>
              <p className="mt-1 text-sm text-violet-100">
                {sL.fastDesc}
              </p>
              <Link href="/sss" className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/30">
                {sL.fastBtn}
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {status === "sent" ? (
              <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.06] p-10 text-center">
                <CheckCircle2 className="h-14 w-14 text-emerald-400" />
                <h2 className="mt-4 text-xl font-bold text-white">{sL.sentTitle}</h2>
                <p className="mt-2 max-w-sm text-sm text-slate-400">
                  {sL.sentDesc}
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  {sL.sentBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-3xl border border-white/[0.07] bg-white/[0.03] p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">{sL.fName}</label>
                    <input required className={inp} placeholder={sL.fNamePh} value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-300">{sL.fEmail}</label>
                    <input required type="email" className={inp} placeholder={sL.fEmailPh} value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">{sL.fSubject}</label>
                  <input required className={inp} placeholder={sL.fSubjectPh} value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">{sL.fMessage}</label>
                  <textarea required rows={5} className={inp + " resize-none"} placeholder={sL.fMessagePh}
                    value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                </div>

                {status === "error" && (
                  <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_-8px_rgba(139,92,246,0.5)] transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {status === "sending" ? sL.sending : sL.send}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
