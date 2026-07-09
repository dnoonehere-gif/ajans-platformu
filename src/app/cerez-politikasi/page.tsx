import type { Metadata } from "next";
import { PageShell, LegalArticle } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Çerez Politikası | Ajans Platformu",
  description: "Ajans Platformu'nun web sitesinde kullanılan çerezler ve bunları nasıl yönetebileceğinize dair bilgiler.",
};

export default function CerezPolitikasiPage() {
  return (
    <PageShell>
      <LegalArticle title="Çerez Politikası" updated="9 Temmuz 2026">
        <p>
          Bu Çerez Politikası, Ajans Platformu web sitesinde ve uygulamasında çerezleri ve
          benzeri teknolojileri nasıl kullandığımızı açıklar. Sitemizi kullanarak bu
          politikada açıklanan çerez kullanımını kabul etmiş olursunuz.
        </p>

        <h2>1. Çerez Nedir?</h2>
        <p>
          Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza kaydedilen küçük
          metin dosyalarıdır. Oturumunuzu hatırlamak, tercihlerinizi saklamak ve deneyimi
          iyileştirmek için kullanılır.
        </p>

        <h2>2. Kullandığımız Çerez Türleri</h2>
        <h3>Zorunlu Çerezler</h3>
        <p>
          Oturum açma, güvenlik ve temel işlevler için gereklidir. Bu çerezler olmadan site
          düzgün çalışmaz ve devre dışı bırakılamaz.
        </p>
        <h3>İşlevsel Çerezler</h3>
        <p>
          Tema tercihi, dil ve arayüz ayarları gibi seçimlerinizi hatırlar; daha kişisel bir
          deneyim sunar.
        </p>
        <h3>Analitik Çerezler</h3>
        <p>
          Ziyaretçilerin siteyi nasıl kullandığını anlamamıza yardımcı olur. Bu veriler
          toplu ve anonim olarak değerlendirilir.
        </p>

        <h2>3. Çerezleri Yönetme</h2>
        <p>
          Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Ancak
          zorunlu çerezleri engellemeniz halinde bazı özellikler çalışmayabilir. Popüler
          tarayıcıların çerez ayarlarına tarayıcı yardım menülerinden ulaşabilirsiniz.
        </p>

        <h2>4. Üçüncü Taraf Çerezleri</h2>
        <p>
          Ödeme, analitik ve içerik hizmetleri için kullandığımız üçüncü taraf sağlayıcılar
          kendi çerezlerini yerleştirebilir. Bu çerezler ilgili sağlayıcıların gizlilik
          politikalarına tabidir.
        </p>

        <h2>5. Değişiklikler</h2>
        <p>
          Bu politikayı güncelleyebiliriz. Güncel sürüm her zaman bu sayfada yayımlanır.
          Ayrıntılı bilgi için <a href="/gizlilik">Gizlilik Politikası</a> sayfamıza
          bakabilirsiniz.
        </p>
      </LegalArticle>
    </PageShell>
  );
}
