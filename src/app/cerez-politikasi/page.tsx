import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { CerezContent } from "./content";

export const metadata: Metadata = {
  title: "Çerez Politikası | Novelya",
  description: "Novelya'nın web sitesinde kullanılan çerezler ve bunları nasıl yönetebileceğinize dair bilgiler.",
};

export default function CerezPolitikasiPage() {
  return (
    <PageShell>
      <CerezContent />
    </PageShell>
  );
}
