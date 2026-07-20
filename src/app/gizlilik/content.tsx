"use client";
import { LegalArticle } from "@/components/marketing/page-shell";
import { useLang } from "@/components/language-provider";

export function GizlilikContent() {
  const { lang } = useLang();

  if (lang === "en") {
    return (
      <LegalArticle title="Privacy Policy" updated="9 July 2026">
        <p>
          At Novelya (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;) we care about your privacy.
          This Privacy Policy explains which personal data we collect when you use our
          services, why and how we process it, whom we share it with, and what your rights
          are. For the legal notice regarding the processing of your data, you can also
          review our <a href="/kvkk">KVKK Privacy Notice</a> page.
        </p>

        <h2>1. Data We Collect</h2>
        <p>To provide our services we may process the following categories of data:</p>
        <ul>
          <li><strong>Account information:</strong> first name, last name, email address, password (stored encrypted), phone number.</li>
          <li><strong>Business/brand information:</strong> brand name, industry, address, logo, contact and social media details.</li>
          <li><strong>Usage data:</strong> session records, IP address, browser and device information, click and navigation data.</li>
          <li><strong>Content data:</strong> the website, menu, chatbot and content data you create on the platform.</li>
          <li><strong>Payment data:</strong> invoice details processed via the payment provider during subscription transactions. Your card details are never stored on our servers.</li>
        </ul>

        <h2>2. Purposes of Use</h2>
        <ul>
          <li>To provide the services, create and manage your account,</li>
          <li>To enable AI-powered content, chatbot and website generation,</li>
          <li>To operate payment and subscription processes,</li>
          <li>To ensure security and prevent fraud,</li>
          <li>To respond to your support requests,</li>
          <li>To fulfil our legal obligations,</li>
          <li>To send informational and marketing communication where you have consented.</li>
        </ul>

        <h2>3. Sharing of Data</h2>
        <p>
          We never sell your personal data. Your data may only be shared with the following
          parties to the extent required by the service:
        </p>
        <ul>
          <li><strong>Infrastructure providers:</strong> suppliers providing hosting, database and email services.</li>
          <li><strong>AI providers:</strong> model providers used for content and chatbot generation.</li>
          <li><strong>Payment institutions:</strong> licensed payment providers that collect subscription fees.</li>
          <li><strong>Competent authorities:</strong> public institutions where legally required.</li>
        </ul>

        <h2>4. Cookies</h2>
        <p>
          We use cookies for session management and to improve the experience. For details,
          visit our <a href="/cerez-politikasi">Cookie Policy</a> page.
        </p>

        <h2>5. Data Security</h2>
        <p>
          We apply technical and administrative measures including encryption, access control
          and regular security audits to protect your data. Your passwords are stored
          encrypted in an irreversible form.
        </p>

        <h2>6. Retention Period</h2>
        <p>
          We retain your personal data for as long as necessary to provide the service and
          for the period required by applicable legislation. When you close your account,
          your data is deleted or anonymised within a reasonable time.
        </p>

        <h2>7. Your Rights</h2>
        <p>
          You have the right to access, correct, delete, restrict the processing of and
          object to the processing of your personal data. You can submit your requests
          through the channels on our <a href="/iletisim">contact</a> page.
        </p>

        <h2>8. Changes</h2>
        <p>
          We may update this policy from time to time. We will notify you of significant
          changes. The current version is always published on this page.
        </p>

        <h2>9. Contact</h2>
        <p>
          For privacy-related questions you can reach us at <a href="mailto:novelya@novelya.com.tr">novelya@novelya.com.tr</a>.
        </p>
      </LegalArticle>
    );
  }

  return (
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
        Gizlilikle ilgili sorularınız için <a href="mailto:novelya@novelya.com.tr">novelya@novelya.com.tr</a>
        adresinden bize ulaşabilirsiniz.
      </p>
    </LegalArticle>
  );
}
