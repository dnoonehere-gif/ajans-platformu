"use client";
import Link from "next/link";
import {
  LayoutDashboard, Users, Building2, Package, CreditCard, Brain, Bot, LogOut, ScrollText,
} from "lucide-react";
import { useLang } from "@/components/language-provider";

const L = {
  tr: {
    overview: "Genel Bakış", users: "Kullanıcılar", brands: "Markalar",
    plans: "Paketler", payments: "Ödemeler", ai: "AI Kullanımı",
    chatbot: "Chatbot", logs: "Sistem Logları", backToDashboard: "Dashboard'a Dön",
  },
  en: {
    overview: "Overview", users: "Users", brands: "Brands",
    plans: "Plans", payments: "Payments", ai: "AI Usage",
    chatbot: "Chatbot", logs: "System Logs", backToDashboard: "Back to Dashboard",
  },
};

export function AdminNav() {
  const { lang } = useLang();
  const s = L[lang];

  const nav = [
    { href: "/elrmgklmer", label: s.overview, icon: LayoutDashboard },
    { href: "/elrmgklmer/kullanicilar", label: s.users, icon: Users },
    { href: "/elrmgklmer/markalar", label: s.brands, icon: Building2 },
    { href: "/elrmgklmer/paketler", label: s.plans, icon: Package },
    { href: "/elrmgklmer/odemeler", label: s.payments, icon: CreditCard },
    { href: "/elrmgklmer/ai", label: s.ai, icon: Brain },
    { href: "/elrmgklmer/chatbot", label: s.chatbot, icon: Bot },
    { href: "/elrmgklmer/loglar", label: s.logs, icon: ScrollText },
  ];

  return (
    <>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] [&.active]:bg-[hsl(var(--primary)/0.12)] [&.active]:text-[hsl(var(--primary))]"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[hsl(var(--border))] p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] transition hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
        >
          <LogOut className="h-4 w-4" />
          {s.backToDashboard}
        </Link>
      </div>
    </>
  );
}
