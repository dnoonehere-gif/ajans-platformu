"use client";
import { LegalArticle } from "@/components/marketing/page-shell";
import { useLang } from "@/components/language-provider";

export function KullanimSartlariContent() {
  const { lang } = useLang();

  if (lang === "en") {
    return (
      <LegalArticle title="Terms of Service" updated="9 July 2026">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Novelya
          (&ldquo;Platform&rdquo;) services. By registering on the Platform or using the
          services, you are deemed to have accepted these Terms. If you do not accept the
          Terms, you should not use the services.
        </p>

        <h2>1. Description of the Service</h2>
        <p>
          The Platform is a software-as-a-service (SaaS) offering tools such as AI-powered
          website building, chatbot, content generation, digital menu, QR feedback, review
          analysis and customer management. The scope of the service may be updated with
          prior notice.
        </p>

        <h2>2. Account and Responsibility</h2>
        <ul>
          <li>You are obliged to provide accurate and up-to-date information during registration.</li>
          <li>You are responsible for the security of your account and the confidentiality of your password.</li>
          <li>You are held responsible for all transactions carried out under your account.</li>
          <li>You must notify us immediately if you notice unauthorised use.</li>
        </ul>

        <h2>3. Acceptable Use</h2>
        <p>When using the Platform you agree not to:</p>
        <ul>
          <li>Produce unlawful, misleading, defamatory content or content infringing third-party rights,</li>
          <li>Distribute malware or endanger system security,</li>
          <li>Reverse engineer the service or copy it without permission,</li>
          <li>Send spam or unsolicited bulk messages,</li>
          <li>Use the Platform for unfair competition or to infringe others&apos; intellectual property.</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <p>
          The Platform&apos;s software, design, brand and content belong to us. The content
          you create through the platform (website, menu, texts, etc.) belongs to you; you
          grant us the limited licence necessary to host that content and provide the
          service.
        </p>

        <h2>5. Subscription and Payment</h2>
        <ul>
          <li>Paid plans are invoiced in advance according to the period you select (monthly/annual).</li>
          <li>At the end of the trial period your subscription starts automatically; you may cancel at any time.</li>
          <li>Prices may be updated with prior notice.</li>
          <li>The <a href="/iade-politikasi">Refund &amp; Cancellation Policy</a> applies to cancellations and refunds.</li>
        </ul>

        <h2>6. Service Continuity</h2>
        <p>
          We strive to provide the service without interruption, but temporary outages may
          occur due to maintenance, updates or unforeseen technical issues. We take care to
          inform you of critical outages.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          The service is provided &ldquo;as is&rdquo;. To the maximum extent permitted by
          applicable law, we cannot be held liable for indirect, incidental or consequential
          damages. It is the user&apos;s responsibility to verify the accuracy of
          AI-generated output before publishing it.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may suspend or terminate your account if you breach these Terms. You may also
          close your account at any time.
        </p>

        <h2>9. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the Republic of Türkiye. Turkish courts and
          enforcement offices have jurisdiction over disputes.
        </p>

        <h2>10. Contact</h2>
        <p>
          For questions you can reach us through our <a href="/iletisim">contact</a> page.
        </p>
      </LegalArticle>
    );
  }

  return (
    <LegalArticle title="Kullanım Şartları" updated="9 Temmuz 2026">
      <p>
        Bu Kullanım Şartları (“Şartlar”), Novelya (“Platform”) hizmetlerini
        kullanımınızı düzenler. Platforma kayıt olarak veya hizmetleri kullanarak bu
        Şartları kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız hizmetleri
        kullanmamalısınız.
      </p>

      <h2>1. Hizmet Tanımı</h2>
      <p>
        Platform; yapay zeka destekli website oluşturma, chatbot, içerik üretimi, dijital
        menü, QR geri bildirim, yorum analizi ve müşteri yönetimi gibi araçlar sunan bir
        yazılım hizmetidir (SaaS). Hizmet kapsamı önceden bildirimde bulunularak
        güncellenebilir.
      </p>

      <h2>2. Hesap ve Sorumluluk</h2>
      <ul>
        <li>Kayıt sırasında doğru ve güncel bilgi vermekle yükümlüsünüz.</li>
        <li>Hesap güvenliğinden ve şifrenizin gizliliğinden siz sorumlusunuz.</li>
        <li>Hesabınız altında gerçekleşen tüm işlemlerden sorumlu tutulursunuz.</li>
        <li>Yetkisiz kullanım fark ederseniz derhal bize bildirmelisiniz.</li>
      </ul>

      <h2>3. Kabul Edilebilir Kullanım</h2>
      <p>Platformu kullanırken aşağıdakileri yapmamayı kabul edersiniz:</p>
      <ul>
        <li>Yasa dışı, yanıltıcı, hakaret içeren veya üçüncü kişilerin haklarını ihlal eden içerik üretmek,</li>
        <li>Zararlı yazılım yaymak veya sistem güvenliğini tehlikeye atmak,</li>
        <li>Hizmeti tersine mühendislikle çözümlemek veya izinsiz kopyalamak,</li>
        <li>Spam veya izinsiz toplu ileti göndermek,</li>
        <li>Platformu haksız rekabet veya başkasının fikri mülkiyetini ihlal amacıyla kullanmak.</li>
      </ul>

      <h2>4. Fikri Mülkiyet</h2>
      <p>
        Platformun yazılımı, tasarımı, markası ve içerikleri bize aittir. Sizin platform
        üzerinden oluşturduğunuz içerikler (website, menü, metinler vb.) size aittir; bu
        içerikleri barındırmak ve hizmeti sunmak için gerekli sınırlı lisansı bize
        vermiş olursunuz.
      </p>

      <h2>5. Abonelik ve Ödeme</h2>
      <ul>
        <li>Ücretli planlar seçtiğiniz periyoda göre (aylık/yıllık) peşin faturalandırılır.</li>
        <li>Deneme süresi sonunda aboneliğiniz otomatik olarak başlar; dilediğiniz zaman iptal edebilirsiniz.</li>
        <li>Fiyatlar önceden bildirimde bulunularak güncellenebilir.</li>
        <li>İptal ve iade koşulları için <a href="/iade-politikasi">İade &amp; İptal Politikası</a> geçerlidir.</li>
      </ul>

      <h2>6. Hizmetin Sürekliliği</h2>
      <p>
        Hizmeti kesintisiz sunmaya çalışırız ancak bakım, güncelleme veya öngörülemeyen
        teknik sorunlar nedeniyle geçici kesintiler yaşanabilir. Kritik kesintilerde sizi
        bilgilendirmeye özen gösteririz.
      </p>

      <h2>7. Sorumluluğun Sınırlandırılması</h2>
      <p>
        Hizmet “olduğu gibi” sunulur. Yürürlükteki mevzuatın izin verdiği azami ölçüde,
        dolaylı, arızi veya sonuçsal zararlardan sorumlu tutulamayız. Yapay zeka ile
        üretilen çıktıların doğruluğunu yayımlamadan önce kontrol etmek kullanıcının
        sorumluluğundadır.
      </p>

      <h2>8. Fesih</h2>
      <p>
        Bu Şartları ihlal etmeniz halinde hesabınızı askıya alabilir veya
        sonlandırabiliriz. Siz de dilediğiniz zaman hesabınızı kapatabilirsiniz.
      </p>

      <h2>9. Uygulanacak Hukuk</h2>
      <p>
        Bu Şartlar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıkların çözümünde
        Türkiye mahkemeleri ve icra daireleri yetkilidir.
      </p>

      <h2>10. İletişim</h2>
      <p>
        Sorularınız için <a href="/iletisim">iletişim</a> sayfamızdan bize ulaşabilirsiniz.
      </p>
    </LegalArticle>
  );
}
