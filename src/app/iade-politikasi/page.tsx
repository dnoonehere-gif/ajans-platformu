import type { Metadata } from "next";
import { PageShell, LegalArticle } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "İade & İptal Politikası | Novelya",
  description: "Novelya abonelikleri için iptal, iade ve cayma hakkı koşulları.",
};

export default function IadePolitikasiPage() {
  return (
    <PageShell>
      <LegalArticle title="İade & İptal Politikası" updated="9 Temmuz 2026">
        <p>
          Bu politika, Novelya ücretli aboneliklerine ilişkin iptal, iade ve cayma
          hakkı koşullarını açıklar. Abonelik satın alarak bu koşulları kabul etmiş
          sayılırsınız.
        </p>

        <h2>1. Abonelik Başlatma</h2>
        <p>
          Planınızı seçtikten sonra ödeme yaparak aboneliğinizi başlatabilirsiniz.
          Aboneliğinizi dilediğiniz zaman iptal edebilirsiniz.
        </p>

        <h2>2. Abonelik İptali</h2>
        <ul>
          <li>Aboneliğinizi hesabınızdaki <strong>Abonelik</strong> sayfasından dilediğiniz zaman iptal edebilirsiniz.</li>
          <li>İptal, mevcut fatura döneminin sonunda geçerli olur; dönem sonuna kadar hizmetten yararlanmaya devam edersiniz.</li>
          <li>İptal sonrası otomatik yenileme durdurulur ve yeni bir ücret alınmaz.</li>
        </ul>

        <h2>3. İade Koşulları</h2>
        <ul>
          <li>Aylık aboneliklerde, dönem başladıktan sonra yapılan iptallerde kullanılan dönem için iade yapılmaz.</li>
          <li>Yıllık aboneliklerde, satın alma tarihinden itibaren <strong>7 gün</strong> içinde ve hizmet esaslı biçimde kullanılmamışsa iade talep edebilirsiniz.</li>
          <li>Teknik bir arıza nedeniyle hizmetten yararlanamadığınız durumlarda, inceleme sonrası orantılı iade değerlendirilir.</li>
        </ul>

        <h2>4. Cayma Hakkı</h2>
        <p>
          Mesafeli Sözleşmeler Yönetmeliği kapsamında, dijital hizmetlerde hizmetin ifasına
          onayınızla başlanması halinde cayma hakkı sona erebilir. Deneme süresi, cayma
          hakkınızı fiilen kullanabilmeniz için tanınan süredir.
        </p>

        <h2>5. İade Süreci</h2>
        <p>
          Onaylanan iadeler, ödemeyi yaptığınız yönteme, ödeme sağlayıcısının süreçlerine
          bağlı olarak genellikle 7–14 iş günü içinde yapılır. İade talebi için
          <a href="/iletisim"> iletişim</a> sayfamızdan bize ulaşabilirsiniz.
        </p>

        <h2>6. Fiyat Değişiklikleri</h2>
        <p>
          Fiyatlarımızı güncelleyebiliriz. Mevcut aboneliğinize ilişkin fiyat değişiklikleri,
          bir sonraki yenileme döneminden itibaren ve önceden bildirimde bulunularak geçerli
          olur.
        </p>
      </LegalArticle>
    </PageShell>
  );
}
