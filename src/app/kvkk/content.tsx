"use client";
import { LegalArticle } from "@/components/marketing/page-shell";
import { useLang } from "@/components/language-provider";

export function KvkkContent() {
  const { lang } = useLang();

  if (lang === "en") {
    return (
      <LegalArticle title="KVKK Privacy Notice" updated="9 July 2026">
        <p>
          This notice has been prepared by Novelya in its capacity as data controller under
          the Turkish Personal Data Protection Law No. 6698 (&ldquo;KVKK&rdquo;). Our aim is
          to inform you about the purposes for which your personal data is processed.
        </p>

        <h2>1. Data Controller</h2>
        <p>
          Your personal data is processed by Novelya as data controller within the scope
          explained below. Contact: <a href="mailto:kvkk@novelya.com.tr">kvkk@novelya.com.tr</a>.
        </p>

        <h2>2. Personal Data Processed</h2>
        <ul>
          <li><strong>Identity and contact:</strong> first name, last name, email, phone.</li>
          <li><strong>Customer transactions:</strong> subscription, payment and invoice details.</li>
          <li><strong>Transaction security:</strong> IP address, log records, device/browser information.</li>
          <li><strong>Marketing:</strong> preference and interaction data, where you have given consent.</li>
        </ul>

        <h2>3. Purposes of Processing</h2>
        <ul>
          <li>Establishing and performing the service agreement,</li>
          <li>Operating subscription and payment processes,</li>
          <li>Managing information security processes,</li>
          <li>Following up requests and complaints,</li>
          <li>Fulfilling legal obligations.</li>
        </ul>

        <h2>4. Legal Grounds for Processing</h2>
        <p>
          Your personal data is processed on the legal grounds of the establishment or
          performance of a contract, compliance with a legal obligation, legitimate interest
          and your explicit consent (KVKK art. 5).
        </p>

        <h2>5. Transfer of Data</h2>
        <p>
          Your data may be transferred to suppliers providing infrastructure, payment and
          artificial intelligence services, and to legally authorised public institutions, in
          accordance with KVKK art. 8 and 9. Necessary security measures are taken for
          transfers abroad.
        </p>

        <h2>6. Method of Collection</h2>
        <p>
          Your personal data is collected through the website, registration forms, cookies
          and electronic communication channels by automated and partially automated means.
        </p>

        <h2>7. Rights of the Data Subject (KVKK art. 11)</h2>
        <p>Under the law you have the following rights:</p>
        <ul>
          <li>To learn whether your personal data is processed,</li>
          <li>To request information if it has been processed,</li>
          <li>To learn the purpose of processing and whether it is used accordingly,</li>
          <li>To request correction of incomplete or inaccurate data,</li>
          <li>To request erasure or destruction,</li>
          <li>To request restriction of processing,</li>
          <li>To object to an adverse outcome arising from automated analysis,</li>
          <li>To claim compensation if you suffer damage.</li>
        </ul>

        <h2>8. Applications</h2>
        <p>
          You may send requests regarding your rights to <a href="mailto:kvkk@novelya.com.tr">kvkk@novelya.com.tr</a>.
          Your applications are concluded free of charge within 30 days at the latest.
        </p>
      </LegalArticle>
    );
  }

  return (
    <LegalArticle title="KVKK Aydınlatma Metni" updated="9 Temmuz 2026">
      <p>
        İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”)
        kapsamında, veri sorumlusu sıfatıyla Novelya tarafından hazırlanmıştır.
        Amacımız, kişisel verilerinizin hangi amaçlarla işlendiği konusunda sizi
        bilgilendirmektir.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>
        Kişisel verileriniz, veri sorumlusu olarak Novelya tarafından aşağıda
        açıklanan kapsamda işlenmektedir. İletişim: <a href="mailto:kvkk@novelya.com.tr">kvkk@novelya.com.tr</a>.
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <ul>
        <li><strong>Kimlik ve iletişim:</strong> ad, soyad, e-posta, telefon.</li>
        <li><strong>Müşteri işlem:</strong> abonelik, ödeme ve fatura bilgileri.</li>
        <li><strong>İşlem güvenliği:</strong> IP adresi, log kayıtları, cihaz/tarayıcı bilgileri.</li>
        <li><strong>Pazarlama:</strong> izin verdiğiniz takdirde tercih ve etkileşim verileri.</li>
      </ul>

      <h2>3. İşleme Amaçları</h2>
      <ul>
        <li>Hizmet sözleşmesinin kurulması ve ifası,</li>
        <li>Abonelik ve ödeme süreçlerinin yürütülmesi,</li>
        <li>Bilgi güvenliği süreçlerinin yönetilmesi,</li>
        <li>Talep ve şikayetlerin takibi,</li>
        <li>Yasal yükümlülüklerin yerine getirilmesi.</li>
      </ul>

      <h2>4. İşlemenin Hukuki Sebepleri</h2>
      <p>
        Kişisel verileriniz; bir sözleşmenin kurulması veya ifası, hukuki yükümlülüğün
        yerine getirilmesi, meşru menfaat ve açık rızanızın bulunması hukuki sebeplerine
        dayanılarak işlenir (KVKK m.5).
      </p>

      <h2>5. Verilerin Aktarılması</h2>
      <p>
        Verileriniz; altyapı, ödeme ve yapay zeka hizmeti sağlayan tedarikçilere ve yasal
        olarak yetkili kamu kurumlarına, KVKK m.8 ve m.9’a uygun olarak aktarılabilir.
        Yurt dışına aktarımlarda gerekli güvenlik tedbirleri alınır.
      </p>

      <h2>6. Toplama Yöntemi</h2>
      <p>
        Kişisel verileriniz; web sitesi, kayıt formları, çerezler ve elektronik iletişim
        kanalları aracılığıyla otomatik ve kısmen otomatik yöntemlerle toplanır.
      </p>

      <h2>7. İlgili Kişinin Hakları (KVKK m.11)</h2>
      <p>Kanun kapsamında aşağıdaki haklara sahipsiniz:</p>
      <ul>
        <li>Kişisel verinizin işlenip işlenmediğini öğrenme,</li>
        <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
        <li>İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme,</li>
        <li>Silinmesini veya yok edilmesini isteme,</li>
        <li>İşlemenin sınırlandırılmasını talep etme,</li>
        <li>Otomatik sistemlerle analiz sonucu aleyhinize bir sonuç çıkmasına itiraz etme,</li>
        <li>Zarara uğramanız halinde giderilmesini talep etme.</li>
      </ul>

      <h2>8. Başvuru</h2>
      <p>
        Haklarınıza ilişkin taleplerinizi <a href="mailto:kvkk@novelya.com.tr">kvkk@novelya.com.tr</a>
        adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde ücretsiz olarak
        sonuçlandırılır.
      </p>
    </LegalArticle>
  );
}
