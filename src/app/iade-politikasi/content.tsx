"use client";
import { LegalArticle } from "@/components/marketing/page-shell";
import { useLang } from "@/components/language-provider";

export function IadeContent() {
  const { lang } = useLang();

  if (lang === "en") {
    return (
      <LegalArticle title="Refund & Cancellation Policy" updated="9 July 2026">
        <p>
          This policy explains the cancellation, refund and withdrawal conditions for paid
          Novelya subscriptions. By purchasing a subscription you are deemed to have accepted
          these conditions.
        </p>

        <h2>1. Starting a Subscription</h2>
        <p>
          After selecting your plan you can start your subscription by completing the
          payment. You may cancel your subscription at any time.
        </p>

        <h2>2. Cancelling a Subscription</h2>
        <ul>
          <li>You can cancel at any time from the <strong>Subscription</strong> page in your account.</li>
          <li>Cancellation takes effect at the end of the current billing period; you keep using the service until then.</li>
          <li>After cancellation, auto-renewal stops and no further charges are made.</li>
        </ul>

        <h2>3. Refund Conditions</h2>
        <ul>
          <li>For monthly subscriptions, no refund is issued for the current period once it has started.</li>
          <li>For annual subscriptions, you may request a refund within <strong>7 days</strong> of purchase provided the service has not been substantially used.</li>
          <li>If you were unable to use the service due to a technical fault, a proportional refund is assessed after review.</li>
        </ul>

        <h2>4. Right of Withdrawal</h2>
        <p>
          Under the Distance Contracts Regulation, for digital services the right of
          withdrawal may end once performance has begun with your consent. The trial period
          is provided so that you can effectively exercise your right of withdrawal.
        </p>

        <h2>5. Refund Process</h2>
        <p>
          Approved refunds are generally completed within 7–14 business days, depending on
          your payment method and the payment provider&apos;s processes. To request a refund,
          reach us via our <a href="/iletisim">contact</a> page.
        </p>

        <h2>6. Price Changes</h2>
        <p>
          We may update our prices. Price changes affecting your existing subscription take
          effect from the next renewal period and with prior notice.
        </p>
      </LegalArticle>
    );
  }

  return (
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
  );
}
