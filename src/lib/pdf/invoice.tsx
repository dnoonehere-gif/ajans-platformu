import React from "react";
import { Document, Page, Text, View, StyleSheet, Svg, Defs, LinearGradient, Stop, Rect } from "@react-pdf/renderer";
import { registerPdfFonts, PDF_FONT_FAMILY } from "./fonts";

registerPdfFonts();

const CONTENT_W = 495;

function GradientBar({ height = 3 }: { height?: number }) {
  return (
    <Svg height={height} width={CONTENT_W} style={{ marginBottom: 28 }}>
      <Defs>
        <LinearGradient id="invgrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#6366f1" />
          <Stop offset="0.55" stopColor="#8b5cf6" />
          <Stop offset="1" stopColor="#a855f7" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={CONTENT_W} height={height} rx={height / 2} fill="url(#invgrad)" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 10,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    color: "#1a1a2e",
  },
  header: {
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoLockup: { flexDirection: "row", alignItems: "center" },
  logoTile: {
    width: 34, height: 34, borderRadius: 9, backgroundColor: "#6366f1",
    color: "#fff", fontSize: 19, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold",
    textAlign: "center", lineHeight: 1.75, marginRight: 10,
  },
  logo: { fontSize: 20, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", color: "#1a1a2e" },
  logoSub: { fontSize: 8, color: "#8888a0", marginTop: 1 },
  invNo: { fontSize: 13, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", textAlign: "right" },
  invDate: { fontSize: 9, color: "#888", textAlign: "right", marginTop: 3 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 8,
    marginBottom: 4,
  },
  th: { fontSize: 8, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", color: "#888", textTransform: "uppercase" },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
    paddingVertical: 12,
  },
  cell: { fontSize: 10 },
  cellSub: { fontSize: 8, color: "#999", marginTop: 2 },
  statusBadge: {
    fontSize: 8,
    fontFamily: PDF_FONT_FAMILY, fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  totalWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 24 },
  totalBox: {
    backgroundColor: "#f8f8fc",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "flex-end",
  },
  totalLabel: { fontSize: 8, color: "#888", marginBottom: 4 },
  totalAmount: { fontSize: 22, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", color: "#6366f1" },
  paidAt: { fontSize: 8, color: "#888", marginTop: 6 },
  footer: {
    position: "absolute",
    bottom: 34,
    left: 50,
    right: 50,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
  },
  footerText: { fontSize: 7.5, color: "#999", textAlign: "center" },
});

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "BEKLEMEDE", color: "#ca8a04", bg: "#fef9c3" },
  PAID: { label: "ÖDENDİ", color: "#16a34a", bg: "#dcfce7" },
  FAILED: { label: "BAŞARISIZ", color: "#dc2626", bg: "#fee2e2" },
  REFUNDED: { label: "İADE EDİLDİ", color: "#2563eb", bg: "#dbeafe" },
};

const PROVIDER_LABELS: Record<string, string> = {
  SHOPIER: "Shopier",
  PAYTR: "PayTR",
  STRIPE: "Stripe",
  MANUAL: "Manuel",
};

export interface InvoicePdfData {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  provider: string;
  providerRef: string | null;
  paidAt: Date | null;
  createdAt: Date;
  brandName: string;
  planName: string;
}

function fmtMoney(cents: number, currency: string) {
  const val = (cents / 100).toLocaleString("tr-TR", { minimumFractionDigits: 0 });
  return `${val} ${currency === "TRY" ? "TL" : currency}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
}

export function InvoicePDF({ inv }: { inv: InvoicePdfData }) {
  const status = STATUS_LABELS[inv.status] ?? STATUS_LABELS.PENDING;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoLockup}>
            <Text style={styles.logoTile}>N</Text>
            <View>
              <Text style={styles.logo}>Novelya</Text>
              <Text style={styles.logoSub}>novelya.com.tr</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invNo}>Fatura #{inv.id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.invDate}>{fmtDate(inv.createdAt)}</Text>
          </View>
        </View>
        <GradientBar />

        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 3 }]}>Açıklama</Text>
          <Text style={[styles.th, { flex: 2 }]}>Marka</Text>
          <Text style={[styles.th, { flex: 2 }]}>Ödeme Yöntemi</Text>
          <Text style={[styles.th, { flex: 2 }]}>Durum</Text>
          <Text style={[styles.th, { flex: 2, textAlign: "right" }]}>Tutar</Text>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 3 }}>
            <Text style={[styles.cell, { fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" }]}>{inv.planName}</Text>
            <Text style={styles.cellSub}>Abonelik</Text>
          </View>
          <Text style={[styles.cell, { flex: 2 }]}>{inv.brandName}</Text>
          <View style={{ flex: 2 }}>
            <Text style={styles.cell}>{PROVIDER_LABELS[inv.provider] ?? inv.provider}</Text>
            {inv.providerRef ? <Text style={styles.cellSub}>Ref: {inv.providerRef}</Text> : null}
          </View>
          <View style={{ flex: 2 }}>
            <Text style={[styles.statusBadge, { color: status.color, backgroundColor: status.bg }]}>
              {status.label}
            </Text>
          </View>
          <Text style={[styles.cell, { flex: 2, textAlign: "right", fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" }]}>
            {fmtMoney(inv.amountCents, inv.currency)}
          </Text>
        </View>

        <View style={styles.totalWrap}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOPLAM</Text>
            <Text style={styles.totalAmount}>{fmtMoney(inv.amountCents, inv.currency)}</Text>
            {inv.paidAt ? <Text style={styles.paidAt}>Ödeme tarihi: {fmtDate(inv.paidAt)}</Text> : null}
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Bu belge Novelya platformu tarafından oluşturulmuştur. Resmi e-fatura yerine geçmez.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
