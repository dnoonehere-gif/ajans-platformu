import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { KullanimSartlariContent } from "./content";

export const metadata: Metadata = {
  title: "Kullanım Şartları | Novelya",
  description: "Novelya hizmetlerini kullanırken geçerli olan kullanım şartları ve koşulları.",
};

export default function KullanimSartlariPage() {
  return (
    <PageShell>
      <KullanimSartlariContent />
    </PageShell>
  );
}
