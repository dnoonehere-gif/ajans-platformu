import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { KvkkContent } from "./content";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Novelya",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin işlenmesine ilişkin aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <PageShell>
      <KvkkContent />
    </PageShell>
  );
}
