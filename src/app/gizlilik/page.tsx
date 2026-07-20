import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/page-shell";
import { GizlilikContent } from "./content";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Novelya",
  description: "Novelya olarak kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuza dair gizlilik politikamız.",
};

export default function GizlilikPage() {
  return (
    <PageShell>
      <GizlilikContent />
    </PageShell>
  );
}
