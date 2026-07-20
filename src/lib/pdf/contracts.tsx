import React from "react";
import {
  Document, Page, Text, View, StyleSheet,
  Svg, Defs, LinearGradient, Stop, Rect,
} from "@react-pdf/renderer";
import { registerPdfFonts, PDF_FONT_FAMILY } from "./fonts";

registerPdfFonts();

// A4 içerik genişliği: 595 - 50 - 50 = 495pt
const CONTENT_W = 495;

// Açık zeminde mor gradient vurgu bandı (yazdırmaya uygun ince şerit)
function GradientBar({ height = 4, width = CONTENT_W, mb = 0 }: { height?: number; width?: number; mb?: number }) {
  return (
    <Svg height={height} width={width} style={{ marginBottom: mb }}>
      <Defs>
        <LinearGradient id="nvgrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#6366f1" />
          <Stop offset="0.55" stopColor="#8b5cf6" />
          <Stop offset="1" stopColor="#a855f7" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} rx={height / 2} fill="url(#nvgrad)" />
    </Svg>
  );
}

// ─── Stiller ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: PDF_FONT_FAMILY,
    fontSize: 10,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    color: "#1a1a2e",
    lineHeight: 1.6,
  },
  // Üst başlık bandı
  header: {
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoLockup: { flexDirection: "row", alignItems: "center" },
  logoTile: {
    width: 30, height: 30, borderRadius: 8, backgroundColor: "#6366f1",
    color: "#fff", fontSize: 17, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold",
    textAlign: "center", lineHeight: 1.7, marginRight: 9,
  },
  logo: { fontSize: 17, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", color: "#1a1a2e" },
  logoSub: { fontSize: 7.5, color: "#8888a0", marginTop: 1 },
  docTitle: { fontSize: 8, color: "#8888a0", textAlign: "right" },
  // Belge başlığı
  title: {
    fontSize: 16,
    fontFamily: PDF_FONT_FAMILY, fontWeight: "bold",
    color: "#1a1a2e",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  // Bilgi kutusu
  infoBox: {
    backgroundColor: "#f7f6ff",
    borderWidth: 1,
    borderColor: "#e6e4fb",
    borderLeftWidth: 3,
    borderLeftColor: "#8b5cf6",
    padding: 16,
    marginBottom: 22,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  infoLabel: { fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", width: 120, fontSize: 9, color: "#2a2a45" },
  infoValue: { flex: 1, fontSize: 9, color: "#555" },
  // Bölümler
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: PDF_FONT_FAMILY, fontWeight: "bold",
    color: "#6d28d9",
    borderLeftWidth: 3,
    borderLeftColor: "#8b5cf6",
    paddingLeft: 9,
    paddingBottom: 2,
    marginBottom: 9,
  },
  paragraph: { fontSize: 9.5, color: "#333", marginBottom: 6, textAlign: "justify" },
  listItem: { fontSize: 9.5, color: "#333", marginBottom: 4, paddingLeft: 12 },
  // Alt bilgi
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: "#e0e0f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: "#aaa" },
  // İmza alanı
  signatureArea: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureBox: {
    width: "44%",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 8,
  },
  signatureLabel: { fontSize: 8, color: "#666" },
  signatureValue: { fontSize: 9, fontFamily: PDF_FONT_FAMILY, fontWeight: "bold", marginTop: 4 },
  badge: {
    backgroundColor: "#ede9fe",
    color: "#6d28d9",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 8,
    fontFamily: PDF_FONT_FAMILY, fontWeight: "bold",
    alignSelf: "flex-start",
    marginBottom: 14,
  },
});

function PageHeader({ title }: { title: string }) {
  const today = new Date().toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={styles.header}>
        <View style={styles.logoLockup}>
          <Text style={styles.logoTile}>N</Text>
          <View>
            <Text style={styles.logo}>Novelya</Text>
            <Text style={styles.logoSub}>Yapay Zekâ Destekli Dijital Ajans Platformu</Text>
          </View>
        </View>
        <View>
          <Text style={styles.docTitle}>{title}</Text>
          <Text style={styles.docTitle}>{today}</Text>
          <Text style={styles.docTitle}>novelya.com.tr</Text>
        </View>
      </View>
      <GradientBar height={3} />
    </View>
  );
}

function Footer({ page }: { page: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>© {new Date().getFullYear()} Novelya — novelya.com.tr</Text>
      <Text style={styles.footerText}>Bu belge elektronik olarak oluşturulmuştur ve yasal olarak geçerlidir.</Text>
      <Text style={styles.footerText}>Sayfa {page}</Text>
    </View>
  );
}

// ─── 1. KULLANICI SÖZLEŞMESİ ────────────────────────────────────────────────
export interface UserAgreementData {
  name: string;
  email: string;
  registeredAt: Date;
  ipAddress?: string;
}

export function UserAgreementPDF({ data }: { data: UserAgreementData }) {
  const date = data.registeredAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  const time = data.registeredAt.toLocaleTimeString("tr-TR");

  return (
    <Document title="Novelya Kullanıcı Sözleşmesi" author="Novelya" language="tr">
      <Page size="A4" style={styles.page}>
        <PageHeader title="Kullanıcı Sözleşmesi" />

        <Text style={styles.title}>KULLANICI SÖZLEŞMESİ</Text>
        <Text style={styles.subtitle}>Son Güncelleme: {date} · Versiyon 1.0</Text>

        <Text style={styles.badge}>KİŞİYE ÖZEL BELGE</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kullanıcı Adı:</Text>
            <Text style={styles.infoValue}>{data.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-posta Adresi:</Text>
            <Text style={styles.infoValue}>{data.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kayıt Tarihi:</Text>
            <Text style={styles.infoValue}>{date} · {time}</Text>
          </View>
          {data.ipAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IP Adresi:</Text>
              <Text style={styles.infoValue}>{data.ipAddress}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hizmet Sağlayıcı:</Text>
            <Text style={styles.infoValue}>Novelya Yazılım Hizmetleri — novelya.com.tr</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. TARAFLAR VE KAPSAM</Text>
          <Text style={styles.paragraph}>
            Bu Kullanıcı Sözleşmesi ("Sözleşme"), Novelya Yazılım Hizmetleri ("Novelya" veya "Hizmet Sağlayıcı")
            ile yukarıda bilgileri belirtilen kullanıcı ("Kullanıcı") arasında akdedilmiştir.
          </Text>
          <Text style={styles.paragraph}>
            Bu Sözleşme; Novelya platformunun (novelya.com.tr) kullanımına ilişkin hak ve yükümlülükleri,
            gizlilik politikasını, fikri mülkiyet haklarını ve taraflar arasındaki hukuki ilişkiyi düzenlemektedir.
            Platforma kaydolmakla Kullanıcı bu Sözleşme'nin tüm hükümlerini okuduğunu, anladığını ve kabul ettiğini
            beyan eder.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. HİZMETİN TANIMI</Text>
          <Text style={styles.paragraph}>
            Novelya; işletmelere yapay zekâ destekli dijital pazarlama araçları sunan, çok kiracılı bir SaaS
            (Yazılım Hizmeti) platformudur. Platform kapsamında sunulan başlıca hizmetler şunlardır:
          </Text>
          <Text style={styles.listItem}>• Yapay zekâ destekli web sitesi oluşturma ve yönetimi</Text>
          <Text style={styles.listItem}>• İşletmeye özel AI chatbot kurulumu ve eğitimi</Text>
          <Text style={styles.listItem}>• AI destekli içerik üretimi (sosyal medya, blog, reklam metinleri)</Text>
          <Text style={styles.listItem}>• Google Business profil yönetimi ve yorum analizi</Text>
          <Text style={styles.listItem}>• QR kod tabanlı müşteri geri bildirim toplama sistemi</Text>
          <Text style={styles.listItem}>• Dijital menü oluşturma ve yönetimi</Text>
          <Text style={styles.listItem}>• Şube ve takım yönetimi araçları</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. KULLANICI YÜKÜMLÜLÜKLERİ</Text>
          <Text style={styles.paragraph}>Kullanıcı, platform kullanımı sırasında aşağıdaki yükümlülüklere uymayı kabul eder:</Text>
          <Text style={styles.listItem}>• Platforma yalnızca yasal amaçlar doğrultusunda erişmek ve kullanmak</Text>
          <Text style={styles.listItem}>• Hesap bilgilerini (şifre vb.) gizli tutmak ve üçüncü şahıslarla paylaşmamak</Text>
          <Text style={styles.listItem}>• Platforma yüklenen içeriklerin fikri mülkiyet hakları bakımından sorumluluğunu üstlenmek</Text>
          <Text style={styles.listItem}>• Başkalarına ait kişisel verileri izinsiz işlememek</Text>
          <Text style={styles.listItem}>• Platformun güvenliğini tehdit edecek girişimlerde bulunmamak</Text>
          <Text style={styles.listItem}>• Yanıltıcı, yasa dışı veya zararlı içerik oluşturmamak</Text>
          <Text style={styles.listItem}>• Platformu yeniden satmamak veya lisanssız ticari amaçla kullanmamak</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. FİKRİ MÜLKİYET HAKLARI</Text>
          <Text style={styles.paragraph}>
            Novelya platformunun tüm yazılım kodları, tasarımları, algoritmaları, yapay zekâ modelleri, marka
            ve logoları Novelya'ya aittir ve Türk Fikir ve Sanat Eserleri Kanunu ile uluslararası fikri mülkiyet
            hukuku kapsamında koruma altındadır.
          </Text>
          <Text style={styles.paragraph}>
            Kullanıcı, platform aracılığıyla ürettiği içeriklerin (metin, görsel, chatbot yanıtları vb.) fikri
            mülkiyet haklarını saklı tutar. Ancak Novelya, hizmetin iyileştirilmesi amacıyla anonim ve toplu
            kullanım verilerini işleme hakkına sahiptir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. GİZLİLİK VE KİŞİSEL VERİLER (KVKK)</Text>
          <Text style={styles.paragraph}>
            Novelya, Kullanıcı'ya ait kişisel verileri 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK)
            ve ilgili mevzuat çerçevesinde işlemektedir. Toplanan veriler; hizmet sunumu, fatura kesimi, müşteri
            desteği ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır.
          </Text>
          <Text style={styles.paragraph}>
            Kullanıcı; kişisel verilerine erişim, düzeltme, silme ve işlemeye itiraz haklarını
            novelya@novelya.com.tr adresine yazılı başvuru yaparak kullanabilir. Detaylı gizlilik politikasına
            novelya.com.tr/gizlilik adresinden ulaşılabilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. HİZMET KISITLARI VE SORUMLULUK SINIRI</Text>
          <Text style={styles.paragraph}>
            Novelya, platformu "olduğu gibi" (as-is) sunmakta olup %99.5 yukarı erişilebilirlik hedeflemektedir.
            Planlı bakım süreçleri, mücbir sebepler (doğal afet, siber saldırı, altyapı arızaları) nedeniyle
            yaşanan kesintilerden Novelya sorumlu tutulamaz.
          </Text>
          <Text style={styles.paragraph}>
            Yapay zekâ tarafından üretilen içerikler öneri niteliğinde olup doğruluk garantisi verilmemektedir.
            Kullanıcı, üretilen içerikleri yayınlamadan önce kontrol etmekle yükümlüdür.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. SÖZLEŞMENİN FESHİ</Text>
          <Text style={styles.paragraph}>
            Kullanıcı, dilediği zaman hesabını kapatarak Sözleşme'yi feshedebilir. Novelya; kullanım
            koşullarının ihlali, dolandırıcılık girişimi veya platformun kötüye kullanımı durumlarında
            hesabı önceden bildirim yapmaksızın askıya alabilir veya silebilir.
          </Text>
          <Text style={styles.paragraph}>
            Hesap kapatıldığında Kullanıcı verileri, KVKK ve yasal saklama yükümlülükleri çerçevesinde
            belirlenen süreler sonunda imha edilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. UYGULANACAK HUKUK VE UYUŞMAZLIK ÇÖZÜMÜ</Text>
          <Text style={styles.paragraph}>
            Bu Sözleşme Türk hukukuna tabidir. Taraflar arasındaki uyuşmazlıklarda öncelikle müzakere
            yolu denenir. Çözüme kavuşturulamazsa İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
            Tüketici uyuşmazlıkları için ilgili Tüketici Hakem Heyeti'ne başvurulabilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. KABUL BEYANI</Text>
          <Text style={styles.paragraph}>
            Kullanıcı, {date} tarihinde Novelya platformuna {data.email} e-posta adresi ile kaydolarak
            bu Sözleşme'nin tüm hükümlerini elektronik ortamda kabul etmiştir. Bu kabul, 5070 sayılı
            Elektronik İmza Kanunu kapsamında geçerli bir onay niteliği taşımaktadır.
          </Text>
        </View>

        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>HİZMET SAĞLAYICI</Text>
            <Text style={styles.signatureValue}>Novelya Yazılım Hizmetleri</Text>
            <Text style={styles.signatureLabel}>novelya.com.tr</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>KULLANICI (ELEKTRONİK KABUL)</Text>
            <Text style={styles.signatureValue}>{data.name}</Text>
            <Text style={styles.signatureLabel}>{data.email} · {date}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Novelya — novelya.com.tr</Text>
          <Text style={styles.footerText}>Bu belge elektronik olarak oluşturulmuştur.</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── 2. ABONELİK SÖZLEŞMESİ ─────────────────────────────────────────────────
export interface SubscriptionAgreementData {
  name: string;
  email: string;
  planName: string;
  planPrice: number;
  planCurrency: string;
  planInterval: string;
  startedAt: Date;
  endsAt: Date;
  orderId?: string;
  brandName?: string;
}

export function SubscriptionAgreementPDF({ data }: { data: SubscriptionAgreementData }) {
  const startDate = data.startedAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  const endDate = data.endsAt.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" });
  const price = (data.planPrice / 100).toLocaleString("tr-TR", { style: "currency", currency: data.planCurrency, minimumFractionDigits: 0 });
  const interval = data.planInterval === "year" ? "Yıllık" : "Aylık";

  return (
    <Document title="Novelya Abonelik Sözleşmesi" author="Novelya" language="tr">
      <Page size="A4" style={styles.page}>
        <PageHeader title="Abonelik Sözleşmesi" />

        <Text style={styles.title}>MESAFELİ ABONELİK SÖZLEŞMESİ</Text>
        <Text style={styles.subtitle}>6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında düzenlenmiştir · {startDate}</Text>

        <Text style={styles.badge}>KİŞİYE ÖZEL — GİZLİ BELGE</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Abone Adı Soyadı:</Text>
            <Text style={styles.infoValue}>{data.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>E-posta:</Text>
            <Text style={styles.infoValue}>{data.email}</Text>
          </View>
          {data.brandName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>İşletme / Marka:</Text>
              <Text style={styles.infoValue}>{data.brandName}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Seçilen Plan:</Text>
            <Text style={styles.infoValue}>{data.planName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ücret:</Text>
            <Text style={styles.infoValue}>{price} / {interval === "Yıllık" ? "yıl" : "ay"} (KDV dahil)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Faturalama Periyodu:</Text>
            <Text style={styles.infoValue}>{interval}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Başlangıç Tarihi:</Text>
            <Text style={styles.infoValue}>{startDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dönem Bitiş Tarihi:</Text>
            <Text style={styles.infoValue}>{endDate}</Text>
          </View>
          {data.orderId && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sipariş / Ödeme No:</Text>
              <Text style={styles.infoValue}>{data.orderId}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ödeme Yöntemi:</Text>
            <Text style={styles.infoValue}>Shopier Güvenli Ödeme Sistemi</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. TARAFLAR</Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" }}>Satıcı (Hizmet Sağlayıcı):</Text>{" "}
            Novelya Yazılım Hizmetleri, novelya.com.tr, novelya@novelya.com.tr
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" }}>Alıcı (Abone):</Text>{" "}
            {data.name} ({data.email})
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. SÖZLEŞMENİN KONUSU VE KAPSAMI</Text>
          <Text style={styles.paragraph}>
            Bu Mesafeli Abonelik Sözleşmesi; Alıcı'nın Novelya platformunda {data.planName} planına abone olması
            karşılığında sunulacak dijital hizmetlerin kapsamını, süresini, bedelini ve tarafların hak ile
            yükümlülüklerini düzenlemektedir.
          </Text>
          <Text style={styles.paragraph}>
            Sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun, Mesafeli Sözleşmeler Yönetmeliği
            ve ilgili mevzuat hükümleri çerçevesinde akdedilmiştir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. HİZMET KAPSAMI — {data.planName.toUpperCase()} PLANI</Text>
          <Text style={styles.paragraph}>Seçilen plan kapsamında aşağıdaki hizmetlerden yararlanılır:</Text>
          <Text style={styles.listItem}>• Yapay zekâ destekli web sitesi oluşturma ve yönetimi</Text>
          <Text style={styles.listItem}>• AI chatbot kurulumu, özelleştirmesi ve bilgi tabanı yönetimi</Text>
          <Text style={styles.listItem}>• Aylık AI içerik üretim kotası (plana göre değişir)</Text>
          <Text style={styles.listItem}>• QR kod geri bildirim sistemi</Text>
          <Text style={styles.listItem}>• Google Business entegrasyonu ve yorum analizi (üst planlarda)</Text>
          <Text style={styles.listItem}>• SEO içerik üretimi (üst planlarda)</Text>
          <Text style={styles.listItem}>• Takım üyeleri ve çoklu marka yönetimi (plana göre değişir)</Text>
          <Text style={styles.listItem}>• {data.planName === "İşletme" ? "Dedike hesap yöneticisi desteği" : data.planName === "Profesyonel" ? "Öncelikli müşteri desteği" : "E-posta müşteri desteği"}</Text>
          <Text style={{ ...styles.paragraph, marginTop: 6, fontFamily: PDF_FONT_FAMILY, fontStyle: "italic", color: "#666" }}>
            Güncel özellik listesi için novelya.com.tr/fiyatlar adresini ziyaret edin.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. ÖDEME VE YENİLEME KOŞULLARI</Text>
          <Text style={styles.paragraph}>
            Abonelik bedeli olan <Text style={{ fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" }}>{price}</Text> ({interval}), ödeme
            işlemi tamamlandığında tahsil edilmiştir. Abonelik her fatura döneminin sonunda otomatik olarak
            yenilenir ve yenileme bedeli kayıtlı ödeme yönteminden çekilir.
          </Text>
          <Text style={styles.paragraph}>
            Ödeme işlemleri Shopier Ödeme Sistemi altyapısı üzerinden SSL şifreli bağlantı ile gerçekleştirilmektedir.
            Kart bilgileri Novelya sistemlerinde saklanmamaktadır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. İPTAL VE İADE KOŞULLARI</Text>
          <Text style={styles.paragraph}>
            Abone, aboneliğini novelya.com.tr/dashboard/abonelik sayfasından veya novelya@novelya.com.tr
            adresine e-posta göndererek dilediği zaman iptal edebilir. İptal işlemi mevcut fatura döneminin
            sonunda geçerli olur; kalan süre için ücret iade edilmez.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" }}>Cayma Hakkı:</Text> Mesafeli Sözleşmeler Yönetmeliği
            uyarınca, dijital içerik ve hizmetlerde hizmetin ifasına başlanılmasıyla birlikte cayma hakkı
            kullanılamaz. Alıcı, ödeme işlemini tamamlayarak hizmetin ifasının başlatılmasına açıkça rıza
            göstermiş ve cayma hakkından feragat etmiştir.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={{ fontFamily: PDF_FONT_FAMILY, fontWeight: "bold" }}>İstisna:</Text> Yıllık abonelikte, satın alma tarihinden
            itibaren 7 (yedi) gün içinde ve hizmet esaslı biçimde kullanılmamışsa iade talebinde bulunulabilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. GİZLİLİK VE VERİ KORUMA</Text>
          <Text style={styles.paragraph}>
            Novelya, Abone'ye ait kişisel ve ticari verileri KVKK (6698 sayılı Kanun) kapsamında koruma altına
            alır. Veriler; hizmet sunumu, faturalandırma ve yasal yükümlülükler dışında üçüncü taraflarla
            paylaşılmaz. Ayrıntılar için novelya.com.tr/gizlilik adresini inceleyiniz.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. UYGULANACAK HUKUK</Text>
          <Text style={styles.paragraph}>
            Bu sözleşme Türk Hukuku'na tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri
            yetkilidir. Tüketici sıfatındaki aboneler, ikametgâhlarındaki Tüketici Hakem Heyeti'ne de
            başvurabilir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. YÜRÜRLÜK VE ONAY</Text>
          <Text style={styles.paragraph}>
            Abone, {startDate} tarihinde Shopier üzerinden ödeme işlemini tamamlayarak bu Mesafeli Abonelik
            Sözleşmesi'nin tüm hükümlerini okuduğunu, anladığını ve kabul ettiğini beyan ve taahhüt eder.
            Elektronik onay, 5070 sayılı Elektronik İmza Kanunu uyarınca yazılı kabul hükmündedir.
          </Text>
        </View>

        <View style={styles.signatureArea}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>HİZMET SAĞLAYICI</Text>
            <Text style={styles.signatureValue}>Novelya Yazılım Hizmetleri</Text>
            <Text style={styles.signatureLabel}>novelya@novelya.com.tr</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>ABONE (ELEKTRONİK ONAY)</Text>
            <Text style={styles.signatureValue}>{data.name}</Text>
            <Text style={styles.signatureLabel}>{data.email} · {startDate}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Novelya — novelya.com.tr</Text>
          <Text style={styles.footerText}>Bu belge elektronik olarak oluşturulmuş, yasal geçerliliği haizdir.</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Sayfa ${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
