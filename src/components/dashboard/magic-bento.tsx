"use client";
import { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";

/**
 * MagicBento efektleri — React Bits'ten uyarlandı.
 *
 * Orijinal bileşen kendi sahte kartlarını çiziyordu. Burada efekt katmanı
 * ayrıştırıldı: mevcut dashboard kartlarımızı SARMALIYOR, böylece gerçek
 * içerik/özellikler korunuyor. Renk sabit mor değil, aktif tema renginden
 * (--primary) okunuyor; 10 renk temasıyla uyumlu.
 *
 * Mobilde ve "hareketi azalt" tercihinde tüm efektler kapanır.
 */

const PARTICLE_COUNT = 10;
const SPOTLIGHT_RADIUS = 320;
const MOBILE_BP = 768;

/** Aktif temanın --primary değerini "r, g, b" biçiminde döndürür. */
function useGlowRgb() {
  const ref = useRef("132, 0, 255");
  useEffect(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;color:hsl(var(--primary))";
    document.body.appendChild(probe);
    const m = getComputedStyle(probe).color.match(/\d+/g);
    if (m && m.length >= 3) ref.current = `${m[0]}, ${m[1]}, ${m[2]}`;
    probe.remove();
  }, []);
  return ref;
}

function devreDisi() {
  if (typeof window === "undefined") return true;
  if (window.innerWidth <= MOBILE_BP) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return document.documentElement.getAttribute("data-reduced-motion") === "true";
}

/** Tek bir kartı sarmalar: parçacıklar, eğilme, mıknatıs, tıklama dalgası. */
export function MagicCard({
  children,
  className = "",
  enableStars = true,
  enableTilt = false,
  enableMagnetism = true,
  clickEffect = true,
}: {
  children: React.ReactNode;
  className?: string;
  enableStars?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const aktifRef = useRef(false);
  const parcaciklarRef = useRef<HTMLDivElement[]>([]);
  const zamanlayicilarRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const glowRgb = useGlowRgb();

  const temizle = useCallback(() => {
    zamanlayicilarRef.current.forEach(clearTimeout);
    zamanlayicilarRef.current = [];
    parcaciklarRef.current.forEach((p) => {
      gsap.to(p, {
        scale: 0, opacity: 0, duration: 0.3, ease: "back.in(1.7)",
        onComplete: () => p.parentNode?.removeChild(p),
      });
    });
    parcaciklarRef.current = [];
  }, []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || devreDisi()) return;

    const parcacikYay = () => {
      if (!aktifRef.current) return;
      const { width, height } = el.getBoundingClientRect();
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const id = setTimeout(() => {
          if (!aktifRef.current) return;
          const p = document.createElement("div");
          p.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;
            background:rgba(${glowRgb.current},1);box-shadow:0 0 6px rgba(${glowRgb.current},.6);
            pointer-events:none;z-index:20;
            left:${Math.random() * width}px;top:${Math.random() * height}px;`;
          el.appendChild(p);
          parcaciklarRef.current.push(p);
          gsap.fromTo(p, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" });
          gsap.to(p, {
            x: (Math.random() - 0.5) * 90, y: (Math.random() - 0.5) * 90,
            rotation: Math.random() * 360, duration: 2 + Math.random() * 2,
            ease: "none", repeat: -1, yoyo: true,
          });
        }, i * 90);
        zamanlayicilarRef.current.push(id);
      }
    };

    const girdi = () => {
      aktifRef.current = true;
      if (enableStars) parcacikYay();
      if (enableTilt) {
        gsap.to(el, { rotateX: 4, rotateY: 4, duration: 0.3, ease: "power2.out", transformPerspective: 1000 });
      }
    };

    const cikti = () => {
      aktifRef.current = false;
      temizle();
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
    };

    const hareket = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const cx = r.width / 2, cy = r.height / 2;
      if (enableTilt) {
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -8, rotateY: ((x - cx) / cx) * 8,
          duration: 0.15, ease: "power2.out", transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        gsap.to(el, { x: (x - cx) * 0.03, y: (y - cy) * 0.03, duration: 0.3, ease: "power2.out" });
      }
    };

    const tikla = (e: MouseEvent) => {
      if (!clickEffect) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const max = Math.max(
        Math.hypot(x, y), Math.hypot(x - r.width, y),
        Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height),
      );
      const dalga = document.createElement("div");
      dalga.style.cssText = `position:absolute;width:${max * 2}px;height:${max * 2}px;border-radius:50%;
        background:radial-gradient(circle, rgba(${glowRgb.current},.35) 0%, rgba(${glowRgb.current},.15) 30%, transparent 70%);
        left:${x - max}px;top:${y - max}px;pointer-events:none;z-index:30;`;
      el.appendChild(dalga);
      gsap.fromTo(dalga, { scale: 0, opacity: 1 },
        { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => dalga.remove() });
    };

    el.addEventListener("mouseenter", girdi);
    el.addEventListener("mouseleave", cikti);
    el.addEventListener("mousemove", hareket);
    el.addEventListener("click", tikla);
    return () => {
      aktifRef.current = false;
      el.removeEventListener("mouseenter", girdi);
      el.removeEventListener("mouseleave", cikti);
      el.removeEventListener("mousemove", hareket);
      el.removeEventListener("click", tikla);
      temizle();
    };
  }, [enableStars, enableTilt, enableMagnetism, clickEffect, temizle, glowRgb]);

  return (
    <div ref={cardRef} className={`nv-magic-card relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/**
 * Izgaranın tamamını saran spot ışığı. İmleç yaklaştıkça kartların kenarı
 * parlar; ızgaradan çıkınca söner.
 */
export function MagicGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const glowRgb = useGlowRgb();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || devreDisi()) return;

    const spot = document.createElement("div");
    spot.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;
      background:radial-gradient(circle, rgba(${glowRgb.current},.12) 0%, rgba(${glowRgb.current},.06) 20%, transparent 70%);
      z-index:5;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
    document.body.appendChild(spot);

    const kartlar = () => Array.from(grid.querySelectorAll<HTMLElement>(".nv-magic-card"));

    const hareket = (e: MouseEvent) => {
      const r = grid.getBoundingClientRect();
      const icerde = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!icerde) {
        gsap.to(spot, { opacity: 0, duration: 0.3 });
        kartlar().forEach((c) => c.style.setProperty("--nv-glow", "0"));
        return;
      }
      const yakin = SPOTLIGHT_RADIUS * 0.5, sonuc = SPOTLIGHT_RADIUS * 0.75;
      let enYakin = Infinity;
      kartlar().forEach((c) => {
        const cr = c.getBoundingClientRect();
        const d = Math.max(0, Math.hypot(e.clientX - (cr.left + cr.width / 2), e.clientY - (cr.top + cr.height / 2))
          - Math.max(cr.width, cr.height) / 2);
        enYakin = Math.min(enYakin, d);
        const g = d <= yakin ? 1 : d <= sonuc ? (sonuc - d) / (sonuc - yakin) : 0;
        c.style.setProperty("--nv-glow-x", `${((e.clientX - cr.left) / cr.width) * 100}%`);
        c.style.setProperty("--nv-glow-y", `${((e.clientY - cr.top) / cr.height) * 100}%`);
        c.style.setProperty("--nv-glow", String(g));
        c.style.setProperty("--nv-glow-rgb", glowRgb.current);
      });
      gsap.to(spot, { left: e.clientX, top: e.clientY, duration: 0.1, ease: "power2.out" });
      gsap.to(spot, {
        opacity: enYakin <= yakin ? 0.7 : enYakin <= sonuc ? ((sonuc - enYakin) / (sonuc - yakin)) * 0.7 : 0,
        duration: 0.2,
      });
    };

    document.addEventListener("mousemove", hareket);
    return () => {
      document.removeEventListener("mousemove", hareket);
      spot.remove();
    };
  }, [glowRgb]);

  return <div ref={gridRef} className={className}>{children}</div>;
}
