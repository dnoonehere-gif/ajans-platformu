import type { Metadata } from "next";
import { PageShell, LegalArticle } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Novelya",
  description: "Novelya olarak kişisel verilerinizi nasıl topladığımız, kullandığımız ve koruduğumuza dair gizlilik politikamız.",
};

export default function GizlilikPage() {
  return (
    <PageShell>
      <LegalArticle title="Gizlilik Politikası" updated="9 Temmuz 2026">
        <p>
          Novelya (“Platform”, “biz”) olarak gizliliğinize önem veriyoruz.
          Bu Gizlilik Politikası; hizmetlerimizi kullandığınızda hangi kişisel verileri
          topladığımızı, bunları neden ve nasıl işlediğimizi, kimlerle paylaştığımızı ve
          haklarınızı açıklar. Verilerinizin işlenmesine ilişkin yasal aydınlatma için
          ayrıca <a href="/kvkk">KVKK Aydınlatma Metni</a> sayfamızı inceleyebilirsiniz.
        </p>

        <h2>1. Topladığımız Veriler</h2>
        <p>Hizmetlerimizi sunabilmek için aşağıdaki veri kategorilerini işleyebiliriz:</p>
        <ul>
          <li><strong>Hesap bilgileri:</strong> ad, soyad, e-posta adresi, şifre (şifrelenmiş olarak), telefon numarası.</li>
          <li><strong>İşletme/marka bilgileri:</strong> marka adı, sektör, adres, logo, iletişim ve sosyal medya bilgileri.</li>
          <li><strong>Kullanım verileri:</strong> oturum kayıtları, IP adresi, tarayıcı ve cihaz bilgileri, tıklama ve gezinme verileri.</li>
          <li><strong>İçerik verileri:</strong> platform üzerinden oluşturduğunuz website, menü, chatbot ve içerik verileri.</li>
          <li><strong>Ödeme verileri:</strong> abonelik işlemlerinde ödeme sağlayıcısı üzerinden işlenen fatura bilgileri. Kart bilgileriniz sunucularımızda saklanmaz.</li>
        </ul>

        <h2>2. Verileri Kullanma Amaçlarımız</h2>
        <ul>
          <li>Hizmetleri sunmak, hesabınızı oluşturmak ve yönetmek,</li>
          <li>Yapay zeka destekli içerik, chatbot ve website üretimini sağlamak,</li>
          <li>Ödeme ve abonelik süreçlerini yürütmek,</li>
          <li>Güvenliği sağlamak, dolandırıcılığı önlemek,</li>
          <li>Destek taleplerinize yanıt vermek,</li>
          <li>Yasal yükümlülüklerimizi yerine getirmek,</li>
          <li>İzin vermeniz halinde bilgilendirme ve pazarlama iletişimi yapmak.</li>
        </ul>

        <h2>3. Verilerin Paylaşılması</h2>
        <p>
          Kişisel verilerinizi satmayız. Verileriniz yalnızca hizmetin gerektirdiği ölçüde,
          aşağıdaki taraflarla paylaşılabilir:
        </p>
        <ul>
          <li><strong>Altyapı sağlayıcıları:</strong> barındırma, veritabanı ve e-posta hizmeti sağlayan tedarikçiler.</li>
          <li><strong>Yapay zeka sağlayıcıları:</strong> içerik ve chatbot üretimi için kullanılan model sağlayıcıları.</li>
          <li><strong>Ödeme kuruluşları:</strong> abonelik tahsilatını gerçekleştiren lisanslı ödeme sağlayıcıları.</li>
          <li><strong>Yetkili merciler:</strong> yasal zorunluluk halinde kamu kurum ve kuruluşları.</li>
        </ul>

        <h2>4. Çerezler</h2>
        <p>
          Oturum yönetimi ve deneyimi iyileştirmek için çerezler kullanıyoruz. Ayrıntılar için
          <a href="/cerez-politikasi"> Çerez Politikası</a> sayfamızı ziyaret edebilirsiniz.
        </p>

        <h2>5. Veri Güvenliği</h2>
        <p>
          Verilerinizi korumak için şifreleme, erişim kontrolü ve düzenli güvenlik denetimleri
          dahil teknik ve idari tedbirler uygularız. Şifreleriniz geri döndürülemez biçimde
          şifrelenerek saklanır.
        </p>

        <h2>6. Saklama Süresi</h2>
        <p>
          Kişisel verilerinizi, hizmetin sunulması için gerekli olduğu ve ilgili mevzuatın
          öngördüğü süre boyunca saklarız. Hesabınızı kapattığınızda verileriniz makul bir
          süre içinde silinir veya anonim hale getirilir.
        </p>

        <h2>7. Haklarınız</h2>
        <p>
          Kişisel verilerinize erişme, düzeltme, silme, işlemeyi kısıtlama ve itiraz etme
          haklarına sahipsiniz. Taleplerinizi <a href="/iletisim">iletişim</a> sayfamızdaki
          kanallar üzerinden iletebilirsiniz.
        </p>

        <h2>8. Değişiklikler</h2>
        <p>
          Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişikliklerde sizi
          bilgilendiririz. Güncel sürüm her zaman bu sayfada yayımlanır.
        </p>

        <h2>9. İletişim</h2>
        <p>
          Gizlilikle ilgili sorularınız için <a href="mailto:destek@novelya.com.tr">destek@novelya.com.tr</a>
          adresinden bize ulaşabilirsiniz.
        </p>
      </LegalArticle>
    </PageShell>
  );
}
