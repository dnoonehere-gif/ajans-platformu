import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { IadeContent } from "./content";

export const metadata: Metadata = {
  title: "İade & İptal Politikası | Novelya",
  description: "Novelya abonelikleri için iptal, iade ve cayma hakkı koşulları.",
};

export default function IadePolitikasiPage() {
  return (
    <PageShell>
      <IadeContent />
    </PageShell>
  );
}
