import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { registerPdfFonts, PDF_FONT_FAMILY } from "./fonts";
import type { BuiltReport, ReportPeriod } from "@/lib/reports";

registerPdfFonts();

type Lang = "tr" | "en";

const T: Record<Lang, {
  reportTitle: string;
  metricsHeading: string;
  generated: string;
  sentiment: string;
  positive: string;
  neutral: string;
  negative: string;
  footer: string;
  period: Record<ReportPeriod, string>;
  metricLabels: string[];
}> = {
  tr: {
    reportTitle: "Performans Raporu",
    metricsHeading: "Genel Metrikler",
    generated: "Oluşturulma",
    sentiment: "Yorum Duygu Analizi",
    positive: "Olumlu",
    neutral: "Nötr",
    negative: "Olumsuz",
    footer: "Bu rapor Novelya platformu tarafından otomatik oluşturulmuştur.",
    period: { week: "Haftalık", month: "Aylık" },
    metricLabels: [
      "Üretilen İçerik", "Alınan Yorum", "Ortalama Puan", "Chatbot Mesaj",
      "QR Tarama", "AI Kullanım", "Gönderilen E-posta", "Yeni Lead (CRM)", "Sosyal Medya Post",
    ],
  },
  en: {
    reportTitle: "Performance Report",
    metricsHeading: "Overview Metrics",
    generated: "Generated",
    sentiment: "Review Sentiment Analysis",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    footer: "This report was generated automatically by the Novelya platform.",
    period: { week: "Weekly", month: "Monthly" },
    metricLabels: [
      "Content Produced", "Reviews Received", "Average Rating", "Chatbot Messages",
      "QR Scans", "AI Usage", "Emails Sent", "New Leads (CRM)", "Social Media Posts",
    ],
  },
};

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
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
    paddingBottom: 16,
    marginBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brand: { fontSize: 26, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", color: "#6366f1" },
  period: { fontSize: 12, color: "#666", marginTop: 4 },
  dateRange: { fontSize: 9, color: "#888", marginTop: 3 },
  genLabel: { fontSize: 8, color: "#aaa", textAlign: "right" },
  genValue: { fontSize: 9, color: "#666", textAlign: "right", marginTop: 2 },
  heading: { fontSize: 14, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -6 },
  card: {
    width: "33.333%",
    padding: 6,
  },
  cardInner: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  cardValue: { fontSize: 26, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" },
  cardLabel: { fontSize: 9, color: "#888", marginTop: 4, textAlign: "center" },
  sentimentRow: { flexDirection: "row", marginTop: 20, marginHorizontal: -6 },
  sentimentBar: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  sentimentText: { fontSize: 11, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" },
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

const CARD_COLORS = ["#6366f1", "#f59e0b", "#6366f1", "#3b82f6", "#10b981", "#ec4899", "#22c55e", "#6366f1", "#3b82f6"];

function fmtDate(iso: string, lang: Lang) {
  return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "tr-TR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function ReportPDF({ report, lang }: { report: BuiltReport; lang: Lang }) {
  const t = T[lang];
  const m = report.metrics;
  const periodLabel = t.period[report.periodKey];

  const values = [
    String(m.contentProduced),
    String(m.reviewsReceived),
    m.avgRating > 0 ? `${m.avgRating} ★` : "—",
    String(m.chatbotInteractions),
    String(m.qrScans),
    String(m.aiUsage),
    String(m.emailsSent),
    String(m.crmLeads),
    String(m.socialPosts),
  ];

  return (
    <Document title={`${report.brand} — ${periodLabel} ${t.reportTitle}`} author="Novelya" language={lang}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{report.brand}</Text>
            <Text style={styles.period}>{periodLabel} {t.reportTitle}</Text>
            <Text style={styles.dateRange}>
              {fmtDate(report.dateRange.from, lang)} – {fmtDate(report.dateRange.to, lang)}
            </Text>
          </View>
          <View>
            <Text style={styles.genLabel}>{t.generated}</Text>
            <Text style={styles.genValue}>{fmtDate(report.generatedAt, lang)}</Text>
          </View>
        </View>

        <Text style={styles.heading}>{t.metricsHeading}</Text>
        <View style={styles.grid}>
          {t.metricLabels.map((label, i) => (
            <View key={label} style={styles.card}>
              <View style={styles.cardInner}>
                <Text style={[styles.cardValue, { color: CARD_COLORS[i] }]}>{values[i]}</Text>
                <Text style={styles.cardLabel}>{label}</Text>
              </View>
            </View>
          ))}
        </View>

        {m.reviewsReceived > 0 && (
          <>
            <Text style={[styles.heading, { marginTop: 24 }]}>{t.sentiment}</Text>
            <View style={styles.sentimentRow}>
              <View style={[styles.sentimentBar, { backgroundColor: "#dcfce7" }]}>
                <Text style={[styles.sentimentText, { color: "#16a34a" }]}>
                  {t.positive}: {m.sentimentBreakdown.positive}
                </Text>
              </View>
              <View style={[styles.sentimentBar, { backgroundColor: "#fef9c3" }]}>
                <Text style={[styles.sentimentText, { color: "#a16207" }]}>
                  {t.neutral}: {m.sentimentBreakdown.neutral}
                </Text>
              </View>
              <View style={[styles.sentimentBar, { backgroundColor: "#fecaca" }]}>
                <Text style={[styles.sentimentText, { color: "#dc2626" }]}>
                  {t.negative}: {m.sentimentBreakdown.negative}
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{t.footer} · {fmtDate(report.generatedAt, lang)}</Text>
        </View>
      </Page>
    </Document>
  );
}
