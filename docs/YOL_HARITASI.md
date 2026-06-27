# Geliştirme Yol Haritası

Proje tek seferde değil, fazlara bölünerek geliştirilir. Her fazın sonunda testler, güvenlik kontrolü ve performans değerlendirmesi yapılır.

## ✅ Faz 0 — Temel (Bu commit)
- [x] Proje iskeleti (Next.js + TS + Tailwind)
- [x] Eksiksiz Prisma şeması (tüm modüller)
- [x] Çekirdek kütüphaneler: prisma, redis, rbac, utils
- [x] Kimlik doğrulama iskeleti (NextAuth v5)
- [x] AI istemcisi (Anthropic) + BullMQ kuyruk/worker altyapısı
- [x] Docker + docker-compose
- [x] Premium ana sayfa + tema (dark/light, glassmorphism)
- [x] Mimari + yol haritası dokümanları

## Faz 1 — Kimlik & Çok Kiracılılık
- [ ] Kayıt / giriş / şifre sıfırlama sayfaları
- [ ] Oturum + RBAC middleware (route koruması)
- [ ] Marka oluşturma, üyelik davetleri, marka içi roller
- [ ] Kullanıcı paneli kabuğu (sidebar, marka değiştirici)

## Faz 2 — Marka Yönetimi
- [ ] Şube ve çalışan yönetimi
- [ ] Logo yükleme, kurumsal renkler, çalışma saatleri
- [ ] Marka ayarları sayfaları

## Faz 3 — AI Website Builder & Editör
- [ ] Bilgi formundan AI ile site üretimi
- [ ] Blok tabanlı sayfa düzenleyici
- [ ] Doğal dil editörü ("buton rengini değiştir")
- [ ] Site yayınlama

## Faz 4 — Google Business & Maps & Yorum Analizi
- [ ] Google Business Profile bağlantısı (OAuth)
- [ ] Yorum senkronizasyonu (kuyruk)
- [ ] AI duygu/konu analizi
- [ ] Performans grafikleri

## Faz 5 — QR Geri Bildirim
- [ ] QR kod üretimi (marka/şube)
- [ ] Halka açık geri bildirim sayfası
- [ ] AI analizi entegrasyonu

## Faz 6 — AI Chatbot
- [ ] Bilgi tabanı yönetimi + gömme (embedding)
- [ ] Sohbet arayüzü ve gömülebilir widget
- [ ] Markaya özel eğitim

## Faz 7 — AI İçerik Üreticisi & Dashboard
- [ ] İçerik türleri (Instagram, blog, reklam, SEO, hashtag)
- [ ] 30 günlük içerik planı
- [ ] Günlük otomatik AI dashboard özeti (zamanlanmış görev)

## Faz 8 — Abonelik & Ödeme
- [ ] Paketler & deneme süresi
- [ ] PayTR entegrasyonu + webhook
- [ ] Fatura geçmişi
- [ ] Stripe'a hazır soyutlama

## Faz 9 — Bildirim & Gerçek Zamanlı
- [ ] Socket.IO sunucusu
- [ ] E-posta + uygulama içi + anlık bildirim
- [ ] Bildirim tercihleri

## Faz 10 — Admin Paneli
- [ ] Kullanıcı / marka / abonelik yönetimi
- [ ] AI kullanım istatistikleri
- [ ] API anahtarları, destek talepleri
- [ ] Sistem ayarları + log görüntüleyici

## Faz 11 — Sertleştirme
- [ ] Test kapsamı (birim + entegrasyon)
- [ ] Güvenlik denetimi (oran sınırlama, girdi doğrulama, token şifreleme)
- [ ] Performans (önbellek, sorgu optimizasyonu)
- [ ] CI/CD
