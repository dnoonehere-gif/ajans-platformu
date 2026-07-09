import type { Metadata } from "next";
import { PageShell, LegalArticle } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Kullanım Şartları | Novelya",
  description: "Novelya hizmetlerini kullanırken geçerli olan kullanım şartları ve koşulları.",
};

export default function KullanimSartlariPage() {
  return (
    <PageShell>
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
    </PageShell>
  );
}
