# DURUM — Novelya

> **Bu dosya iki bilgisayar arasındaki köprüdür.** Claude'un hafızası makineye
> özeldir ve senkronlanmaz; bu dosya depoda olduğu için `git pull` ile gelir.
> Her oturumun sonunda güncellenir. Önce bunu oku, sonra çalışmaya başla.

**Son güncelleme:** 09.08.2026

---

## Şu an nerede duruyoruz

Ürün canlı: <https://www.novelya.com.tr> · Panel: `/dashboard` · Yönetim: `/elrmgklmer`
Altyapı: Next.js 15 + Prisma + Supabase + Railway + Cloudflare.

**Ödeyen müşteri henüz YOK.** Ürün geniş, doğrulanmış kısmı dar.
Öncelik yeni özellik değil, **ilk müşteriyi bulmak ve ödeme akışını canlı test etmek.**

## Fiyatlar (09.08.2026'da düşürüldü)

| Paket | Aylık | Yıllık |
|---|---|---|
| Başlangıç | 499 ₺ | 4.990 ₺ |
| Profesyonel | 999 ₺ | 9.990 ₺ |
| İşletme | 1.899 ₺ | 18.990 ₺ |
| Ajans | 3.499 ₺ | 34.990 ₺ |

Alan adı hizmeti: kurulum **1.900 ₺**, yenileme **1.500 ₺/yıl** (maliyet 728 ₺).
İşletme ve Ajans paketlerinde kurulum ücretsiz.

⚠️ **Fiyat değiştirirken üç yeri birden güncelle:** veritabanı (`Plan.priceCents`),
`src/app/api/plans/seed/route.ts`, ve **Shopier ürünleri**. Biri atlanırsa müşteri
sitede gördüğünden farklı tutar öder.

## Bekleyen işler — sırayla

1. **Shopier fiyatlarını güncelle** (sitede 499 ₺ yazıyor, Shopier'de 899 ₺ olabilir) — ACİL
2. **İlk gerçek satın alma testi** — ödeme yolu hiç çalıştırılmadı. En ucuz plandan
   alım yapıp Railway loglarında `Shopier webhook: imza incelemesi` satırını izle:
   abonelik açılıyor mu, fatura oluşuyor mu, onay maili gidiyor mu.
3. **PostHog verisi** — çalışır hâle geldi. Bakılacak: 368 ziyaretçi/gün geliyor
   ama kayıt 0. Kaç kişi `/kayit` sayfasına gidiyor, formda nerede bırakıyor?
4. **Google OAuth doğrulaması** — uygulama hâlâ "Testing" modunda; müşteriler
   "Google ile kayıt" kullanamıyor. Test kullanıcısı eklendi, yayınlama için
   `business.manage` hassas kapsam incelemesi gerekiyor.
5. **Müşteri bulma** — DM'lerden dönüş yok. Plan: Karaköy'de yüz yüze gezmek.
   Hedef listesi ve hazırlanan mesajlar aşağıda.

## Müşteri adayları (Karaköy, öncelik sırası)

1. **Nostalji Karaköy** — ₺800-1.000 bilet, hiç yorum cevabı yok, Arap müşteri
2. **Mouette Cafe** (Galata) — aktif sahip ama telefon/site yok, 4 dilli müşteri
3. **Galata Konak** — 4.245 yorum / 4,0 puan, cevapsız Çince şikâyet
4. **Insta Karaköy** — kafe + otel, iki mülk
5. **IT'S OK Coffee** — yeni açılmış, müşteriye aç
6. Key Karaköy · Art's Coffee · Fanus · Papel
— OPS Cafe ve Lol Coffee: profil sahipsiz, sadece ücretsiz yardım, satış yok

**On işletmenin onunda web sitesi yok.** Altısında Arapça/çok dilli müşteri var.
Çok dilli menü ve chatbot bu bölgede en güçlü satış argümanı.

## Pazarlama varlıkları — `pazarlama/`

- `pazarlama/sosyal/kaydirmali/` — 8 slayt, genel tanıtım (1080×1080)
- `pazarlama/sosyal/video/` — Reels 1080×1920, akış 1080×1350, kare 1080×1080
- `pazarlama/sosyal/sektorler/` — kuafor · kafe · klinik · otel · veteriner
  (her biri 6 slayt + 15 sn video, sektöre özel renk ve metin)
- `pazarlama/shopier/` — 8 ürün görseli, güncel fiyatlarla
- `pazarlama/novelya-og.png` — sitenin paylaşım görseli (`public/og.png` ile aynı)

Görseller `scripts/pazarlama-gorseller.mjs` ile yeniden üretilebilir.
Video üretimi `ffmpeg-static` istiyor: `npm i ffmpeg-static --no-save --legacy-peer-deps`

## Bilinmesi gereken tuzaklar

- **`NEXT_PUBLIC_*` değişkenleri DERLEME anında gömülür.** Railway'e sonradan
  eklenen değişken çalışmaz, yeniden derleme şart. PostHog aylarca bu yüzden
  çalışmadı. Yeni değişkenleri sunucudan prop olarak geçirmek daha güvenli.
- **Bot Fight Mode AÇILMAYACAK** — Shopier webhook'unu, Meta/WhatsApp link
  önizlemesini ve UptimeRobot'u sessizce bozar.
- **Cloudflare robots.txt yönetimi AÇILMAYACAK** — uygulamanın `robots.ts`'i var.
- **Alt alan adları** artık çalışıyor (wildcard DNS + Worker) ama panelde
  `/site/<slug>` gösteriliyor.
- **Supabase Storage** yeni `sb_secret_*` anahtarlarıyla `apikey` başlığı istiyor.
- **`.env` asla commit edilmez.**
- Her AI testi kullanıcının kredisinden harcar — toplu test öncesi haber ver.

## Yapılmayacaklar

- Kullanıcı adına DM/e-posta gönderme — tüm mesajları kullanıcı kendi atar.
- Sohbete API anahtarı, şifre veya webhook tokeni yazma.
- Google/Meta hesaplarını tarayıcıdan sürme — Meta hesabı bu yüzden askıya
  alınmıştı. Ekran görüntüsüyle yönlendir, tıklamayı kullanıcı yapar.
