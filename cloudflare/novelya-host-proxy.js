/**
 * Cloudflare Worker — müşteri alan adlarını Railway'e taşır.
 *
 * SORUN: Railway gelen isteği Host başlığına göre eşleştiriyor. Tanımadığı
 * bir alan adı geldiğinde "Application not found" dönüyor ve Railway'deki
 * özel alan adı kotamız dolu. Yani her yeni müşteri alan adını Railway'e
 * eklemek mümkün değil.
 *
 * ÇÖZÜM: Worker isteği Railway'e iletirken Host'u tanınan adresle değiştirir,
 * ziyaretçinin gerçekte yazdığı adresi ayrı bir başlıkta taşır. Uygulama
 * middleware'i o başlığı okuyup hangi markanın sitesi olduğunu bulur.
 *
 * KURULUM
 *   1. Cloudflare → Workers & Pages → Create → Worker → bu dosyayı yapıştır
 *   2. Deploy
 *   3. Worker → Settings → Domains & Routes → Add route
 *        Route:  *novelya.com.tr/*        Zone: novelya.com.tr
 *      (müşteri alan adları için de ayrı route eklenir: *musteri.com/*)
 */

const ORIGIN = "xk5d6v7m.up.railway.app";
const TANINAN_HOST = "www.novelya.com.tr";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const gercekHost = url.hostname;

    // Ana alan adı zaten Railway'de tanımlı; dokunma, doğrudan geçsin.
    if (gercekHost === TANINAN_HOST || gercekHost === "novelya.com.tr") {
      return fetch(request);
    }

    const hedef = new URL(request.url);
    hedef.hostname = ORIGIN;
    hedef.protocol = "https:";
    hedef.port = "";

    const basliklar = new Headers(request.headers);
    basliklar.set("Host", TANINAN_HOST);
    // Ziyaretçinin yazdığı gerçek adres — middleware bunu okuyor.
    basliklar.set("x-forwarded-host-original", gercekHost);

    const yeniIstek = new Request(hedef.toString(), {
      method: request.method,
      headers: basliklar,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      redirect: "manual",
    });

    return fetch(yeniIstek);
  },
};
