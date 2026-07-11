"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CreditCard } from "lucide-react";
import Link from "next/link";
import { useBrand } from "./brand-provider";

type State = "active" | "suspended" | "none" | null;

export function SubscriptionBanner() {
  const { activeBrand } = useBrand();
  const [state, setState] = useState<State>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!activeBrand) return;
    fetch(`/api/subscription/status?brandId=${activeBrand.id}`)
      .then((r) => r.json())
      .then((d) => {
        setState(d.state);
      })
      .catch(() => null);
  }, [activeBrand?.id]);

  if (!state || state === "active" || state === "none" || dismissed) return null;

  if (state === "suspended") {
    return (
      <div className="flex items-center justify-between gap-4 bg-red-500/10 border-b border-red-500/20 px-6 py-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm font-medium text-red-300">
            Aboneliğiniz askıya alındı. Verileriniz 30 gün boyunca korunur.
          </p>
        </div>
        <Link
          href="/dashboard/abonelik"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
        >
          <CreditCard className="h-3.5 w-3.5" />
          Aboneliği Yenile
        </Link>
      </div>
    );
  }

  return null;
}
