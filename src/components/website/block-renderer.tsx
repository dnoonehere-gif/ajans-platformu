"use client";
import type { Block, SiteTheme } from "@/server/ai/website-generator";
import { PALETTES, FONT_PAIRS } from "@/server/ai/website-themes";
import { EditProvider, T, Media } from "./editable";
import {
  Scissors, Sparkles, Clock, Phone, MapPin, Star, Shield, Heart, Wrench,
  Car, Coffee, Camera, Users, Award, Check, Calendar, Mail, type LucideIcon,
} from "lucide-react";

/**
 * Üretilen bloklar burada HTML'e dönüşür.
 *
 * Tema (palet/tipografi/yoğunluk) CSS değişkenlerine yazılır; bütün bloklar
 * yalnızca bu değişkenleri okur. Böylece tek bir tema değişikliği sayfanın
 * tamamını değiştirir ve her site birbirine benzemez.
 */

const ICONS: Record<string, LucideIcon> = {
  scissors: Scissors, sparkles: Sparkles, clock: Clock, phone: Phone,
  "map-pin": MapPin, star: Star, shield: Shield, heart: Heart, wrench: Wrench,
  car: Car, coffee: Coffee, camera: Camera, users: Users, award: Award,
  check: Check, calendar: Calendar, mail: Mail,
};

function Icon({ name, className = "h-5 w-5" }: { name?: string; className?: string }) {
  const C = ICONS[(name ?? "").toLowerCase()] ?? Sparkles;
  return <C className={className} strokeWidth={1.75} />;
}

const PAD = { sikisik: "py-12", normal: "py-20", ferah: "py-28" } as const;

export function BlockRenderer({
  blocks, theme, editable = false, onUpdate, onFocusField, uploadMedia,
}: {
  blocks: Block[];
  theme?: SiteTheme | null;
  /** true ise metinler tıklanıp yerinde düzenlenir (sadece editör önizlemesi) */
  editable?: boolean;
  onUpdate?: (blockId: string, path: string, value: string) => void;
  onFocusField?: (blockId: string, path: string) => void;
  /** Görsel/video yükleyip herkese açık URL döndürür */
  uploadMedia?: (file: File) => Promise<string | null>;
}) {
  const palette = PALETTES.find((p) => p.id === theme?.paletteId) ?? PALETTES[0];
  const fonts = FONT_PAIRS.find((f) => f.id === theme?.fontPairId) ?? FONT_PAIRS[0];
  const radius = theme?.radius ?? 16;
  const density = theme?.density ?? "normal";

  const style = {
    "--w-bg": palette.bg,
    "--w-surface": palette.surface,
    "--w-ink": palette.ink,
    "--w-ink-soft": palette.inkSoft,
    "--w-accent": palette.accent,
    "--w-accent-ink": palette.accentInk,
    "--w-r": `${radius}px`,
    "--w-r-sm": `${Math.max(4, radius - 6)}px`,
    "--w-display": fonts.display,
    "--w-body": fonts.body,
    "--w-tracking": fonts.tracking,
    background: "var(--w-bg)",
    color: "var(--w-ink)",
    fontFamily: "var(--w-body)",
  } as React.CSSProperties;

  return (
    <div style={style}>
      <style>{`
        .w-h { font-family: var(--w-display); letter-spacing: var(--w-tracking); ${fonts.upper ? "text-transform: uppercase;" : ""} }
        .w-card { background: var(--w-surface); border-radius: var(--w-r); }
        .w-btn { background: var(--w-accent); color: var(--w-accent-ink); border-radius: var(--w-r-sm); }
      `}</style>
      {blocks.map((b) => (
        <EditProvider
          key={b.id}
          value={{
            editable,
            blockId: b.id,
            update: (bid, path, value) => onUpdate?.(bid, path, value),
            onFocusField,
            uploadMedia,
          }}
        >
          <Section block={b} pad={PAD[density]} heroLayout={theme?.heroLayout ?? "ortali-buyuk"} />
        </EditProvider>
      ))}
    </div>
  );
}

function Section({ block, pad, heroLayout }: { block: Block; pad: string; heroLayout: string }) {
  const d = block.data;
  switch (block.type) {
    case "hero":         return <Hero d={d} layout={heroLayout} />;
    case "services":     return <Cards d={d} pad={pad} variant={block.variant} surface />;
    case "features":     return <Cards d={d} pad={pad} variant={block.variant} />;
    case "about":        return <About d={d} pad={pad} />;
    case "gallery":      return <Gallery d={d} pad={pad} variant={block.variant} />;
    case "pricing":      return <Pricing d={d} pad={pad} />;
    case "hours":        return <Hours d={d} pad={pad} />;
    case "faq":          return <Faq d={d} pad={pad} />;
    case "team":         return <Team d={d} pad={pad} />;
    case "testimonials": return <Testimonials d={d} pad={pad} />;
    case "cta":          return <Cta d={d} pad={pad} />;
    case "contact":      return <Contact d={d} pad={pad} />;
    default:             return null;
  }
}

type D = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));

function Heading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`w-h text-3xl font-bold md:text-4xl ${className}`}>{children}</h2>;
}

/** Bölüm başlığı — düzenlenebilir. */
function HeadT({ d, className = "", fallback = "" }: { d: D; className?: string; fallback?: string }) {
  return <T data={d} path="title" as="h2" fallback={fallback} className={`w-h block text-3xl font-bold md:text-4xl ${className}`} />;
}

/* ── Hero: düzen seçimi sayfanın karakterini belirler ─────────────── */
function Hero({ d, layout }: { d: D; layout: string }) {
  const eyebrow = s(d.eyebrow);
  const cta = (
    <a href={s(d.ctaHref) || "#contact"} className="w-btn inline-block px-8 py-3.5 font-semibold shadow-lg transition hover:opacity-90">
      <T data={d} path="cta" fallback="İletişime Geç" />
    </a>
  );
  const label = eyebrow && (
    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--w-accent)" }}><T data={d} path="eyebrow" /></p>
  );

  if (layout === "bolunmus") {
    return (
      <section className="grid md:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-24 md:px-12" style={{ background: "var(--w-surface)" }}>
          {label}
          <T data={d} path="headline" as="h1" className="w-h block text-4xl font-bold leading-[1.05] md:text-5xl" />
          <T data={d} path="subheadline" as="p" className="mt-5 max-w-md text-base block" style={{ color: "var(--w-ink-soft)" }} />
          <div className="mt-8">{cta}</div>
        </div>
        <Media data={d} path="image" className="min-h-[280px]" style={{ background: `linear-gradient(160deg, var(--w-accent), var(--w-bg))` }} />
      </section>
    );
  }

  if (layout === "sol-yazi-sag-foto") {
    return (
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2">
        <div>
          {label}
          <T data={d} path="headline" as="h1" className="w-h block text-4xl font-bold leading-[1.05] md:text-5xl" />
          <T data={d} path="subheadline" as="p" className="mt-5 text-base block" style={{ color: "var(--w-ink-soft)" }} />
          <div className="mt-8">{cta}</div>
        </div>
        <Media data={d} path="image" className="aspect-[4/3] w-full overflow-hidden" style={{ background: `linear-gradient(140deg, var(--w-accent), var(--w-surface))`, borderRadius: "var(--w-r)" }} />
      </section>
    );
  }

  if (layout === "tam-ekran-foto") {
    return (
      <section className="relative flex min-h-[80vh] items-center justify-center px-6 text-center"
        style={{ background: `linear-gradient(200deg, var(--w-accent), var(--w-bg) 70%)` }}>
        <div className="max-w-3xl">
          {label}
          <T data={d} path="headline" as="h1" className="w-h block text-5xl font-bold leading-[1.02] md:text-7xl" />
          <T data={d} path="subheadline" as="p" className="mx-auto mt-6 max-w-xl text-lg block" style={{ color: "var(--w-ink-soft)" }} />
          <div className="mt-10">{cta}</div>
        </div>
      </section>
    );
  }

  if (layout === "minimal-satir") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-28">
        {label}
        <T data={d} path="headline" as="h1" className="w-h block text-3xl font-bold leading-tight md:text-4xl" />
        <T data={d} path="subheadline" as="p" className="mt-4 text-base block" style={{ color: "var(--w-ink-soft)" }} />
        <div className="mt-8">{cta}</div>
      </section>
    );
  }

  return (
    <section className="px-6 py-28 text-center">
      {label}
      <T data={d} path="headline" as="h1" className="w-h mx-auto block max-w-4xl text-5xl font-bold leading-[1.02] md:text-6xl" />
      <T data={d} path="subheadline" as="p" className="mx-auto mt-6 max-w-xl text-base block" style={{ color: "var(--w-ink-soft)" }} />
      <div className="mt-9">{cta}</div>
    </section>
  );
}

/* ── services / features: dört farklı yerleşim ────────────────────── */
function Cards({ d, pad, variant, surface }: { d: D; pad: string; variant?: string; surface?: boolean }) {
  const items = (d.items as { icon?: string; title: string; desc: string; price?: string }[]) ?? [];
  if (items.length === 0) return null;
  const bg = surface ? { background: "var(--w-surface)" } : undefined;

  if (variant === "numarali-liste") {
    return (
      <section className={`px-6 ${pad}`} style={bg}>
        <div className="mx-auto max-w-3xl">
          <HeadT d={d} className="mb-10" />
          <div className="divide-y" style={{ borderColor: "var(--w-ink-soft)" }}>
            {items.map((it, i) => (
              <div key={i} className="flex gap-6 py-6">
                <span className="w-h shrink-0 text-2xl font-bold tabular-nums" style={{ color: "var(--w-accent)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <T data={d} path={`items.${i}.title`} as="h3" className="w-h mb-1.5 block text-lg font-semibold" />
                  <T data={d} path={`items.${i}.desc`} as="p" className="block text-sm leading-relaxed" style={{ color: "var(--w-ink-soft)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "yatay-satir") {
    return (
      <section className={`px-6 ${pad}`} style={bg}>
        <div className="mx-auto max-w-5xl">
          <HeadT d={d} className="mb-10" />
          <div className="space-y-4">
            {items.map((it, i) => (
              <div key={i} className="w-card flex items-center gap-5 p-6">
                <span className="shrink-0" style={{ color: "var(--w-accent)" }}><Icon name={it.icon} className="h-7 w-7" /></span>
                <div className="flex-1">
                  <T data={d} path={`items.${i}.title`} as="h3" className="w-h block font-semibold" />
                  <T data={d} path={`items.${i}.desc`} as="p" className="mt-1 block text-sm" style={{ color: "var(--w-ink-soft)" }} />
                </div>
                {it.price && <span className="w-h shrink-0 font-bold" style={{ color: "var(--w-accent)" }}>{it.price}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (variant === "ikon-solda" || variant === "fiyatli-liste") {
    return (
      <section className={`px-6 ${pad}`} style={bg}>
        <div className="mx-auto max-w-4xl">
          <HeadT d={d} className="mb-10" />
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {items.map((it, i) => (
              <div key={i} className="flex gap-4">
                <span className="shrink-0" style={{ color: "var(--w-accent)" }}><Icon name={it.icon} className="h-6 w-6" /></span>
                <div>
                  <h3 className="w-h font-semibold">
                    {it.title}
                    {it.price && <span className="ml-2 text-sm font-normal" style={{ color: "var(--w-accent)" }}>{it.price}</span>}
                  </h3>
                  <T data={d} path={`items.${i}.desc`} as="p" className="mt-1 block text-sm leading-relaxed" style={{ color: "var(--w-ink-soft)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`px-6 ${pad}`} style={bg}>
      <HeadT d={d} className="mb-12 text-center" />
      <div className={`mx-auto grid max-w-5xl gap-5 ${items.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {items.map((it, i) => (
          <div key={i} className="w-card p-7">
            <span className="inline-flex" style={{ color: "var(--w-accent)" }}><Icon name={it.icon} className="h-7 w-7" /></span>
            <T data={d} path={`items.${i}.title`} as="h3" className="w-h mb-2 mt-4 block text-lg font-semibold" />
            <T data={d} path={`items.${i}.desc`} as="p" className="block text-sm leading-relaxed" style={{ color: "var(--w-ink-soft)" }} />
            {it.price && <p className="w-h mt-4 font-bold" style={{ color: "var(--w-accent)" }}>{it.price}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function About({ d, pad }: { d: D; pad: string }) {
  const stats = (d.stats as { value: string; label: string }[]) ?? [];
  return (
    <section className={`px-6 ${pad}`}>
      <div className="mx-auto max-w-3xl">
        <HeadT d={d} className="mb-6" />
        <T data={d} path="body" as="p" className="block text-base leading-relaxed" style={{ color: "var(--w-ink-soft)" }} />
        {stats.length > 0 && (
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {stats.map((st, i) => (
              <div key={i} className="w-card p-6 text-center">
                <div className="w-h text-3xl font-bold" style={{ color: "var(--w-accent)" }}>{st.value}</div>
                <div className="mt-1 text-sm" style={{ color: "var(--w-ink-soft)" }}>{st.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/** Görseller henüz yüklenmemişse yer tutucu gösterir (medya yükleme geldiğinde dolar). */
function Gallery({ d, pad, variant }: { d: D; pad: string; variant?: string }) {
  const images = (d.images as string[]) ?? [];
  const slots = images.length > 0 ? images : Array.from({ length: 6 }, () => "");
  const grid = variant === "seritli" ? "grid-cols-2 md:grid-cols-4"
    : variant === "mozaik" ? "grid-cols-2 md:grid-cols-3"
    : "grid-cols-2 md:grid-cols-3";
  return (
    <section className={`px-6 ${pad}`} style={{ background: "var(--w-surface)" }}>
      <HeadT d={d} className="mb-10 text-center" />
      <div className={`mx-auto grid max-w-5xl gap-3 ${grid}`}>
        {slots.map((src, i) => (
          <Media
            key={i}
            data={d}
            path={`images.${i}`}
            className={`overflow-hidden ${variant === "mozaik" && i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"}`}
            style={{ borderRadius: "var(--w-r-sm)", background: src ? undefined : "var(--w-bg)" }}
          />
        ))}
      </div>
    </section>
  );
}

function Pricing({ d, pad }: { d: D; pad: string }) {
  const items = (d.items as { title: string; price: string; desc?: string }[]) ?? [];
  if (items.length === 0) return null;
  return (
    <section className={`px-6 ${pad}`}>
      <HeadT d={d} className="mb-10 text-center" />
      <div className="mx-auto max-w-2xl">
        {items.map((it, i) => (
          <div key={i} className="flex items-baseline gap-4 border-b py-4 last:border-0" style={{ borderColor: "var(--w-surface)" }}>
            <span className="w-h font-semibold">{it.title}</span>
            <span className="flex-1 border-b border-dotted opacity-30" />
            <span className="w-h font-bold tabular-nums" style={{ color: "var(--w-accent)" }}>{it.price}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Hours({ d, pad }: { d: D; pad: string }) {
  const rows = (d.rows as { gun: string; saat: string }[]) ?? [];
  if (rows.length === 0) return null;
  return (
    <section className={`px-6 ${pad}`} style={{ background: "var(--w-surface)" }}>
      <HeadT d={d} className="mb-8 text-center" />
      <div className="mx-auto max-w-sm space-y-2.5">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{r.gun}</span>
            <span className="tabular-nums" style={{ color: "var(--w-ink-soft)" }}>{r.saat}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq({ d, pad }: { d: D; pad: string }) {
  const items = (d.items as { q: string; a: string }[]) ?? [];
  if (items.length === 0) return null;
  return (
    <section className={`px-6 ${pad}`}>
      <HeadT d={d} className="mb-10" />
      <div className="mx-auto max-w-2xl space-y-3">
        {items.map((it, i) => (
          <details key={i} className="w-card group p-5">
            <summary className="w-h cursor-pointer list-none font-semibold marker:hidden">{it.q}</summary>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--w-ink-soft)" }}>{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Team({ d, pad }: { d: D; pad: string }) {
  const items = (d.items as { name: string; role: string; bio?: string; photo?: string }[]) ?? [];
  if (items.length === 0) return null;
  return (
    <section className={`px-6 ${pad}`}>
      <HeadT d={d} className="mb-10 text-center" />
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
        {items.map((m, i) => (
          <div key={i} className="text-center">
            {m.photo
              ? <Media data={d} path={`items.${i}.photo`} className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full" />
              : (
                <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full text-2xl font-bold"
                  style={{ background: "var(--w-accent)", color: "var(--w-accent-ink)" }}>
                  {m.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            <h3 className="w-h font-semibold">{m.name}</h3>
            <p className="text-sm" style={{ color: "var(--w-accent)" }}>{m.role}</p>
            {m.bio && <p className="mt-2 text-sm" style={{ color: "var(--w-ink-soft)" }}>{m.bio}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ d, pad }: { d: D; pad: string }) {
  const items = (d.items as { text: string; author: string; rating?: number }[]) ?? [];
  if (items.length === 0) return null;
  return (
    <section className={`px-6 ${pad}`} style={{ background: "var(--w-surface)" }}>
      <HeadT d={d} className="mb-10 text-center" />
      <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <figure key={i} className="p-6" style={{ background: "var(--w-bg)", borderRadius: "var(--w-r)" }}>
            <div className="mb-3 flex gap-0.5" style={{ color: "var(--w-accent)" }}>
              {Array.from({ length: t.rating ?? 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}
            </div>
            <blockquote className="text-sm leading-relaxed">{t.text}</blockquote>
            <figcaption className="mt-4 text-sm font-semibold" style={{ color: "var(--w-ink-soft)" }}>{t.author}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Cta({ d, pad }: { d: D; pad: string }) {
  return (
    <section className={`px-6 ${pad}`}>
      <div className="mx-auto max-w-3xl p-12 text-center"
        style={{ background: "var(--w-accent)", color: "var(--w-accent-ink)", borderRadius: "var(--w-r)" }}>
        <T data={d} path="title" as="h2" className="w-h block text-3xl font-bold" />
        <T data={d} path="body" as="p" className="mx-auto mt-4 block max-w-lg opacity-90" />
        <a href={s(d.buttonHref) || "#contact"}
          className="mt-8 inline-block px-8 py-3.5 font-semibold transition hover:opacity-90"
          style={{ background: "var(--w-bg)", color: "var(--w-ink)", borderRadius: "var(--w-r-sm)" }}>
          <T data={d} path="buttonText" fallback="İletişime Geç" />
        </a>
      </div>
    </section>
  );
}

function Contact({ d, pad }: { d: D; pad: string }) {
  const phone = s(d.phone), email = s(d.email), address = s(d.address);
  return (
    <section id="contact" className={`px-6 ${pad}`} style={{ background: "var(--w-surface)" }}>
      <HeadT d={d} className="mb-10 text-center" fallback="İletişim" />
      <div className="mx-auto max-w-md space-y-4">
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-3 transition hover:opacity-70">
            <Phone className="h-5 w-5 shrink-0" style={{ color: "var(--w-accent)" }} /><span>{phone}</span>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-3 transition hover:opacity-70">
            <Mail className="h-5 w-5 shrink-0" style={{ color: "var(--w-accent)" }} /><span>{email}</span>
          </a>
        )}
        {address && (
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--w-accent)" }} /><span>{address}</span>
          </p>
        )}
      </div>
    </section>
  );
}
