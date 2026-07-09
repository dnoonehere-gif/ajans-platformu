import type { Metadata } from "next";
import { PageShell, LegalArticle } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Novelya",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında kişisel verilerinizin işlenmesine ilişkin aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <PageShell>
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
    </PageShell>
  );
}
