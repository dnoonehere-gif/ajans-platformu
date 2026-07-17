"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    title: "Kayıt Ol",
    name: "Adınız Soyadınız",
    phone: "05xx xxx xx xx",
    email: "ornek@email.com",
    password: "En az 8 karakter",
    strength: ["Çok zayıf", "Zayıf", "Orta", "Güçlü"],
    captcha: "Güvenlik Sorusu",
    captchaAnswer: "Cevap",
    newQuestion: "Yeni soru",
    submit: "Kayıt Ol",
    haveAccount: "Zaten hesabınız var mı?",
    login: "Giriş Yap",
    doneTitle: "Hesabınız oluşturuldu!",
    doneDesc1: "adresine doğrulama maili gönderdik. Lütfen gelen kutunuzu kontrol edin.",
    goLogin: "Giriş Sayfasına Git",
    genericError: "Bir hata oluştu",
  },
  en: {
    title: "Sign Up",
    name: "Full name",
    phone: "Phone number",
    email: "you@example.com",
    password: "At least 8 characters",
    strength: ["Very weak", "Weak", "Medium", "Strong"],
    captcha: "Security Question",
    captchaAnswer: "Answer",
    newQuestion: "New question",
    submit: "Sign Up",
    haveAccount: "Already have an account?",
    login: "Sign In",
    doneTitle: "Your account has been created!",
    doneDesc1: "— we sent a verification email. Please check your inbox.",
    goLogin: "Go to Sign In",
    genericError: "Something went wrong",
  },
};

const lineInput =
  "w-full border-0 border-b border-gray-300 bg-transparent px-0 py-2.5 text-[15px] text-gray-900 outline-none transition-colors hover:border-violet-500 focus:border-b-2 focus:border-violet-600 placeholder:text-gray-400 hover:placeholder:text-violet-400";

export default function KayitPage() {
  const router = useRouter();
  const { lang } = useLang();
  const sL = L[lang];
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const loadCaptcha = useCallback(async () => {
    setCaptchaAnswer("");
    try {
      const res = await fetch("/api/auth/captcha");
      setCaptcha(await res.json());
    } catch { /* sessiz */ }
  }, []);

  useEffect(() => { loadCaptcha(); }, [loadCaptcha]);

  const strength = (() => {
    const p = form.password;
    if (p.length === 0) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"][strength - 1] ?? "bg-gray-200";
  const strengthLabel = sL.strength[strength - 1] ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captcha) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/kayit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, captchaAnswer, captchaToken: captcha.token }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? sL.genericError);
      setLoading(false);
      loadCaptcha(); // token tek kullanımlık gibi davran, yenile
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-2xl shadow-black/20">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-500" />
        <h2 className="mb-2 text-xl font-bold text-gray-900">{sL.doneTitle}</h2>
        <p className="mb-6 text-sm text-gray-500">
          <strong>{form.email}</strong> {sL.doneDesc1}
        </p>
        <button
          onClick={() => router.push("/giris")}
          className="h-11 w-full rounded-md bg-violet-600 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-violet-700"
        >
          {sL.goLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-8 shadow-2xl shadow-black/25">
      <h1 className="mb-8 text-lg font-bold text-gray-900">{sL.title}</h1>

      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <input
            type="text"
            required
            placeholder={sL.name}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={lineInput}
          />
        </div>

        <div>
          <input
            type="tel"
            required
            placeholder={sL.phone}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={lineInput}
          />
        </div>

        <div>
          <input
            type="email"
            required
            placeholder={sL.email}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={lineInput}
          />
        </div>

        <div>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              required
              minLength={8}
              placeholder={sL.password}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={`${lineInput} pr-9`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">{strengthLabel}</p>
            </div>
          )}
        </div>

        {/* Captcha */}
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-600" /> {sL.captcha}
            </label>
            <button type="button" onClick={loadCaptcha} title={sL.newQuestion}
              className="text-gray-400 transition hover:text-gray-600">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900">{captcha?.question ?? "..."}</span>
            <input
              type="text"
              required
              inputMode="numeric"
              placeholder={sL.captchaAnswer}
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-violet-600"
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !captcha}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-violet-600 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {sL.submit}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-500">
        {sL.haveAccount}{" "}
        <Link href="/giris" className="font-semibold text-violet-600 hover:underline">
          {sL.login}
        </Link>
      </div>
    </div>
  );
}
