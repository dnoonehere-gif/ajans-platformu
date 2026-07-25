/**
 * E-postayı suistimal tespiti için normalize eder.
 * - Tümü küçük harf, boşluklar atılır.
 * - Gmail/Googlemail: nokta'lar ve "+etiket" kısmı elenir
 *   (foo.bar+promo@gmail.com → foobar@gmail.com), tüm alan gmail.com'a sabitlenir.
 * - Diğer sağlayıcılarda yalnızca "+etiket" kısmı atılır.
 *
 * Amaç: aynı gerçek kişinin ürettiği alias'ları tek anahtara indirgeyip
 * tekrar tekrar ücretsiz deneme açmasını engellemek.
 */
export function normalizeEmail(email: string): string {
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at === -1) return e;

  let local = e.slice(0, at);
  const domain = e.slice(at + 1);

  // +etiket her sağlayıcıda atılır
  local = local.split("+")[0];

  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
    return `${local}@gmail.com`;
  }

  return `${local}@${domain}`;
}
