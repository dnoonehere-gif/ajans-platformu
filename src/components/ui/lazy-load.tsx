"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

// Intersection Observer tabanlı lazy render
export function LazySection({
  children,
  fallback,
  rootMargin = "200px",
  className,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {visible ? children : (fallback ?? <DefaultSkeleton />)}
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground)/0.4)]" />
    </div>
  );
}

// Genel skeleton bileşeni
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[hsl(var(--muted)/0.6)] ${className}`} />
  );
}

// Kart skeleton
export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  );
}

// Tablo skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="h-10 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]" />
      <div className="divide-y divide-[hsl(var(--border))]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ height = "h-48" }: { height?: string }) {
  return (
    <div className={`glass rounded-2xl p-5 ${height}`}>
      <Skeleton className="h-4 w-1/4 mb-4" />
      <div className="flex items-end gap-2 h-32">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 rounded-sm"
            style={{ height: `${30 + Math.random() * 70}%` }} />
        ))}
      </div>
    </div>
  );
}
