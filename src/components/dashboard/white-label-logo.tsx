"use client";
import { useWhiteLabel } from "./white-label-provider";
import { LogoMark } from "@/components/logo";

export function WhiteLabelLogo() {
  const wl = useWhiteLabel();

  if (wl?.agencyLogoUrl) {
    return (
      <div className="flex items-center gap-3">
        <img src={wl.agencyLogoUrl} alt="" className="h-8 w-8 rounded-lg object-contain" />
        <div>
          <p className="text-sm font-bold leading-tight">{wl.agencyName ?? "Dashboard"}</p>
          {!wl.hideNovelya && <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Powered by Novelya</p>}
        </div>
      </div>
    );
  }

  if (wl?.agencyName) {
    return (
      <div className="flex items-center gap-3">
        <LogoMark size={32} />
        <div>
          <p className="text-sm font-bold leading-tight">{wl.agencyName}</p>
          {!wl.hideNovelya && <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Powered by Novelya</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <LogoMark size={32} />
      <div>
        <p className="text-sm font-bold leading-tight">Novelya</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Dashboard</p>
      </div>
    </div>
  );
}
