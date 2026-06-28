"use client";
import type { Block } from "@/server/ai/website-generator";

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-0">
      {blocks.map((block) => (
        <BlockSection key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockSection({ block }: { block: Block }) {
  switch (block.type) {
    case "hero":      return <HeroBlock data={block.data} />;
    case "features":  return <FeaturesBlock data={block.data} />;
    case "about":     return <AboutBlock data={block.data} />;
    case "services":  return <ServicesBlock data={block.data} />;
    case "cta":       return <CtaBlock data={block.data} />;
    case "contact":   return <ContactBlock data={block.data} />;
    default:          return null;
  }
}

function HeroBlock({ data }: { data: Record<string, unknown> }) {
  const bg = (data.bgColor as string) ?? "#6366f1";
  return (
    <section
      className="relative overflow-hidden px-6 py-28 text-center"
      style={{ background: `linear-gradient(135deg, ${bg}33 0%, ${bg}08 60%)` }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{ background: `radial-gradient(60% 60% at 50% 0%, ${bg}28, transparent)` }}
      />
      <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
        {data.headline as string}
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base text-[hsl(var(--muted-foreground))]">
        {data.subheadline as string}
      </p>
      <div className="mt-8">
        <a
          href={data.ctaHref as string}
          className="rounded-xl px-7 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
          style={{ backgroundColor: bg }}
        >
          {data.cta as string}
        </a>
      </div>
    </section>
  );
}

function FeaturesBlock({ data }: { data: Record<string, unknown> }) {
  const items = data.items as { icon: string; title: string; desc: string }[];
  return (
    <section className="bg-[hsl(var(--muted)/0.3)] px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-bold">{data.title as string}</h2>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {items?.map((item, i) => (
          <div key={i} className="glass rounded-2xl p-6 text-center">
            <div className="mb-3 text-4xl">{item.icon}</div>
            <h3 className="mb-2 font-semibold">{item.title}</h3>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutBlock({ data }: { data: Record<string, unknown> }) {
  const stats = data.stats as { value: string; label: string }[];
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-3xl font-bold">{data.title as string}</h2>
        <p className="mb-10 leading-relaxed text-[hsl(var(--muted-foreground))]">{data.body as string}</p>
        <div className="grid grid-cols-3 gap-6 text-center">
          {stats?.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="text-3xl font-bold text-[hsl(var(--primary))]">{s.value}</div>
              <div className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesBlock({ data }: { data: Record<string, unknown> }) {
  const items = data.items as { title: string; desc: string; icon: string }[];
  return (
    <section className="bg-[hsl(var(--muted)/0.3)] px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-bold">{data.title as string}</h2>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
        {items?.map((item, i) => (
          <div key={i} className="glass flex items-start gap-4 rounded-2xl p-6">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <h3 className="mb-1 font-semibold">{item.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaBlock({ data }: { data: Record<string, unknown> }) {
  const btnColor = (data.buttonColor as string) ?? "#6366f1";
  return (
    <section className="px-6 py-20 text-center">
      <div className="glass mx-auto max-w-2xl rounded-3xl p-12">
        <h2 className="mb-4 text-3xl font-bold">{data.title as string}</h2>
        <p className="mb-8 text-[hsl(var(--muted-foreground))]">{data.body as string}</p>
        <a
          href={data.buttonHref as string}
          className="rounded-xl px-8 py-3 font-semibold text-white shadow-lg transition hover:opacity-90"
          style={{ backgroundColor: btnColor }}
        >
          {data.buttonText as string}
        </a>
      </div>
    </section>
  );
}

function ContactBlock({ data }: { data: Record<string, unknown> }) {
  return (
    <section id="contact" className="bg-[hsl(var(--muted)/0.3)] px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-bold">{data.title as string}</h2>
      <div className="mx-auto max-w-md space-y-4 text-center">
        {data.phone && (
          <p className="text-lg">
            📞{" "}
            <a href={`tel:${data.phone}`} className="hover:text-[hsl(var(--primary))]">
              {data.phone as string}
            </a>
          </p>
        )}
        {data.email && (
          <p className="text-lg">
            ✉️{" "}
            <a href={`mailto:${data.email}`} className="hover:text-[hsl(var(--primary))]">
              {data.email as string}
            </a>
          </p>
        )}
        {data.address && <p className="text-lg">📍 {data.address as string}</p>}
      </div>
    </section>
  );
}
