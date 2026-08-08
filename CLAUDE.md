# Novelya — çalışma kuralları

## Her oturumun başında

1. **`git pull`** çalıştır. Proje iki farklı bilgisayarda geliştiriliyor;
   diğer makinedeki iş yalnızca GitHub üzerinden gelir.
2. **`DURUM.md`** dosyasını oku. Nerede kalındığı, fiyatlar, bekleyen işler ve
   bilinen tuzaklar orada. Claude'un kendi hafızası makineye özeldir ve
   senkronlanmaz — makineler arası tek gerçek kaynak bu dosyadır.

Bu ikisi bir dakika sürer ve bağlamı yeniden keşfetmekten çok daha ucuzdur.

## Her oturumun sonunda

Kalıcı bir şey değiştiyse **`DURUM.md`'yi güncelle** ve commit et:
tamamlanan iş, değişen fiyat/karar, yeni bekleyen iş, öğrenilen tuzak.
Sonra push et — yoksa diğer bilgisayar eski hâli görür.

## Dil

Kullanıcıyla **Türkçe** konuş. Kod yorumları ve commit mesajları da Türkçe.
Arayüz metinleri iki dilli (TR/EN) — yeni metin eklerken ikisini de yaz.

## Kod

- Değişiklikten sonra `npx tsc --noEmit` ve `npx next build` çalıştır.
- Dev server açıkken build alma; ikisi aynı `.next` klasörünü kullanıp çakışır.
- Commit mesajı **neyin neden değiştiğini** anlatsın, dosya listesi değil.
- `.env` asla commit edilmez.

## Fiyat değiştirirken

Üç yeri birden güncelle, biri atlanırsa müşteri yanlış tutar öder:
1. Veritabanı (`Plan.priceCents`)
2. `src/app/api/plans/seed/route.ts`
3. **Shopier ürünleri** — bunu kullanıcı yapar, hatırlat

Shopier ürün numaralarını asla tahmin etme; sayfayı açıp ad ve fiyatı doğrula.
(Bir kere Profesyonel ve İşletme bağlantıları ters bağlanmıştı.)

## Kullanıcı adına yapılmayacaklar

- DM, e-posta veya mesaj gönderme — kullanıcı kendi atar.
- Meta/Google hesaplarını tarayıcıdan sürme — Meta hesabı bu yüzden askıya
  alınmıştı. Ekran görüntüsüyle yönlendir.
- Sohbete anahtar, şifre, token yazma.
- Toplu AI testi öncesi haber ver; her çağrı kullanıcının kredisinden düşer.
