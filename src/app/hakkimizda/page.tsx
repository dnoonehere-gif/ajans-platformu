import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { HakkimizdaContent } from "./content";

export const metadata: Metadata = {
  title: "Hakkımızda | Novelya",
  description: "Novelya; küçük ve orta ölçekli işletmelerin dijital varlığını yapay zeka ile güçlendiren tek platform.",
};

export default function HakkimizdaPage() {
  return (
    <PageShell>
      <HakkimizdaContent />
    </PageShell>
  );
}
