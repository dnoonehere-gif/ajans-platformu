# Ajans Platformu

Türkiye'deki işletmeler için **yapay zekâ destekli, çok kiracılı (multi-tenant) SaaS + Dijital Ajans** platformu. Müşteriler kendi hesaplarını oluşturur, markalarını yönetir ve yapay zekâ destekli araçlardan faydalanır. Arayüz tamamen Türkçedir.

## Teknoloji Yığını

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** + **Framer Motion** (premium, glassmorphism, dark/light)
- **PostgreSQL** + **Prisma**
- **Redis** + **BullMQ** (arka plan görevleri)
- **NextAuth v5** (rol bazlı kimlik doğrulama)
- **Socket.IO** (gerçek zamanlı bildirimler)
- **Anthropic** (yapay zekâ modülleri)
- **Docker** (üretim dağıtımı)

## Hızlı Başlangıç

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Ortam değişkenlerini ayarla
cp .env.example .env   # değerleri doldur

# 3) Veritabanını hazırla (Docker ile Postgres + Redis)
docker compose up -d db redis
npm run db:migrate
npm run db:seed

# 4) Geliştirme sunucusu
npm run dev

# 5) Arka plan işçisi (ayrı terminal)
npm run worker
```

Varsayılan giriş (tohumdan): `admin@ajans.com` / `admin123` — **üretimde değiştirin.**

## Tamamen Docker ile

```bash
docker compose up --build
```

## Belgeler

- [`docs/MIMARI.md`](docs/MIMARI.md) — sistem mimarisi, klasör yapısı, modül ilişkileri
- [`docs/YOL_HARITASI.md`](docs/YOL_HARITASI.md) — fazlara bölünmüş geliştirme planı

## Roller

Süper Admin · Admin · Müşteri · Personel — tümü rol bazlı yetkilendirme (`src/lib/rbac.ts`) ile yönetilir.

## Güvenlik Notu

`.env` dosyası ve gerçek API anahtarları **asla** depoya gönderilmez (`.gitignore` ile korunur). Token'lar (Google, ödeme) veritabanında şifrelenmiş saklanmalıdır.
