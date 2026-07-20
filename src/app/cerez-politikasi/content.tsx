"use client";
import { LegalArticle } from "@/components/marketing/page-shell";
import { useLang } from "@/components/language-provider";

export function CerezContent() {
  const { lang } = useLang();

  if (lang === "en") {
    return (
      <LegalArticle title="Cookie Policy" updated="9 July 2026">
        <p>
          This Cookie Policy explains how we use cookies and similar technologies on the
          Novelya website and application. By using our site, you accept the use of cookies
          described in this policy.
        </p>

        <h2>1. What Is a Cookie?</h2>
        <p>
          Cookies are small text files saved to your browser by the websites you visit. They
          are used to remember your session, store your preferences and improve your
          experience.
        </p>

        <h2>2. Types of Cookies We Use</h2>
        <h3>Essential Cookies</h3>
        <p>
          Required for sign-in, security and core functionality. Without these cookies the
          site does not work properly, and they cannot be disabled.
        </p>
        <h3>Functional Cookies</h3>
        <p>
          Remember choices such as your theme preference, language and interface settings to
          offer a more personal experience.
        </p>
        <h3>Analytics Cookies</h3>
        <p>
          Help us understand how visitors use the site. This data is evaluated in aggregate
          and anonymously.
        </p>

        <h2>3. Managing Cookies</h2>
        <p>
          You can delete or block cookies from your browser settings. However, if you block
          essential cookies, some features may not work. You can reach the cookie settings of
          popular browsers from their help menus.
        </p>

        <h2>4. Third-Party Cookies</h2>
        <p>
          Third-party providers we use for payment, analytics and content services may place
          their own cookies. These cookies are subject to the privacy policies of the
          relevant providers.
        </p>

        <h2>5. Changes</h2>
        <p>
          We may update this policy. The current version is always published on this page.
          For more details, see our <a href="/gizlilik">Privacy Policy</a> page.
        </p>
      </LegalArticle>
    );
  }

  return (
    <LegalArticle title="Çerez Politikası" updated="9 Temmuz 2026">
      <p>
        Bu Çerez Politikası, Novelya web sitesinde ve uygulamasında çerezleri ve
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
  );
}
