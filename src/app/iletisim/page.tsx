"use client";
import { useState } from "react";
import { Mail, MessageSquare, Clock, Send, Loader2, CheckCircle2, HelpCircle } from "lucide-react";
import Link from "next/link";
import { PageShell } from "@/components/marketing/page-shell";

const CONTACT = [
  { icon: Mail, title: "E-posta", value: "destek@novelya.com.tr", href: "mailto:destek@novelya.com.tr" },
  { icon: Clock, title: "Yanıt Süresi", value: "Genellikle 24 saat içinde" },
  { icon: MessageSquare, title: "Destek", value: "Hesabınızdan canlı destek" },
];

const inp = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100 placeholder:text-gray-400";

export default function IletisimPage() {
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
      if (!res.ok) { setError(data.error ?? "Bir hata oluştu."); setStatus("error"); return; }
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
      setStatus("error");
    }
  }

  return (
    <PageShell>
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            <MessageSquare className="h-3.5 w-3.5" /> İletişim
          </span>
          <h1 className="mt-5 text-4xl font-black text-gray-900 sm:text-5xl">Bize ulaşın</h1>
          <p className="mt-4 text-lg text-gray-600">
            Sorularınız, önerileriniz veya iş birliği talepleriniz için formu doldurun;
            en kısa sürede size dönüş yapalım.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-5">
          {/* İletişim bilgileri */}
          <div className="space-y-4 lg:col-span-2">
            {CONTACT.map((c) => (
              <div key={c.title} className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white/70 p-5 backdrop-blur">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                  <c.icon className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{c.title}</p>
                  {c.href ? (
                    <a href={c.href} className="mt-0.5 block text-sm text-violet-700 hover:underline">{c.value}</a>
                  ) : (
                    <p className="mt-0.5 text-sm text-gray-500">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-5 text-white">
              <HelpCircle className="h-6 w-6" />
              <p className="mt-3 font-bold">Hızlı yanıt mı arıyorsunuz?</p>
              <p className="mt-1 text-sm text-violet-100">
                Sık sorulan soruların çoğunun cevabı SSS sayfamızda.
              </p>
              <Link href="/sss" className="mt-3 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/30">
                SSS’ye Git
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {status === "sent" ? (
              <div className="flex h-full min-h-80 flex-col items-center justify-center rounded-3xl border border-green-100 bg-green-50/50 p-10 text-center">
                <CheckCircle2 className="h-14 w-14 text-green-500" />
                <h2 className="mt-4 text-xl font-bold text-gray-900">Mesajınız iletildi!</h2>
                <p className="mt-2 max-w-sm text-sm text-gray-600">
                  Teşekkürler. En kısa sürede belirttiğiniz e-posta adresinden dönüş yapacağız.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-6 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                >
                  Yeni Mesaj Gönder
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-3xl border border-gray-100 bg-white/70 p-6 backdrop-blur sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">Ad Soyad</label>
                    <input required className={inp} placeholder="Adınız" value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">E-posta</label>
                    <input required type="email" className={inp} placeholder="ornek@mail.com" value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Konu</label>
                  <input required className={inp} placeholder="Mesajınızın konusu" value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
                </div>
                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">Mesaj</label>
                  <textarea required rows={5} className={inp + " resize-none"} placeholder="Bize nasıl yardımcı olabiliriz?"
                    value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                </div>

                {status === "error" && (
                  <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                >
                  {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {status === "sending" ? "Gönderiliyor..." : "Mesajı Gönder"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
