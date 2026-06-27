# Sistem Mimarisi

Bu belge platformun mimari kararlarını, klasör yapısını, veritabanı şemasını ve modüller arası ilişkileri açıklar.

## 1. Mimari Genel Bakış

Platform üç katmanlı, olay/kuyruk destekli bir mimari kullanır:

```
┌─────────────────────────────────────────────────────────────┐
│  İSTEMCİ (Next.js App Router - React 19)                      │
│  Kurumsal Site · Kullanıcı Paneli · Admin Paneli              │
└───────────────┬───────────────────────────────┬──────────────┘
                │ Server Actions / REST API       │ Socket.IO
┌───────────────▼───────────────┐   ┌─────────────▼─────────────┐
│  UYGULAMA KATMANI              │   │  GERÇEK ZAMANLI KATMAN     │
│  - Kimlik (NextAuth v5)        │   │  - Bildirimler            │
│  - RBAC (global + marka içi)   │   │  - Canlı dashboard        │
│  - Servisler (modül mantığı)   │   └───────────────────────────┘
└───────┬───────────────┬────────┘
        │               │
┌───────▼──────┐  ┌──────▼─────────┐  ┌────────────────────────┐
│ PostgreSQL   │  │ Redis + BullMQ │  │ Yapay Zekâ (Anthropic) │
│ (Prisma)     │  │ Arka plan işler│  │ İçerik/Chatbot/Analiz  │
└──────────────┘  └────────────────┘  └────────────────────────┘
```

**Çok kiracılılık (multi-tenant):** Kiracı birimi **Marka (Brand)**'dır. Her veri kaydı `brandId` ile izole edilir; bir kullanıcı yalnızca üyesi olduğu markaların verisini görür. Bu, satır düzeyinde (row-level) izolasyon ile servis katmanında zorunlu kılınır.

## 2. Klasör Yapısı

```
ajans-platform/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması (tüm modüller)
│   └── seed.ts                # Başlangıç verileri
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (site)/            # Kurumsal site (ana sayfa, hizmetler, blog...)
│   │   ├── (auth)/            # giris, kayit
│   │   ├── (panel)/           # Müşteri paneli (markalar, AI araçları)
│   │   ├── (admin)/           # Admin paneli
│   │   └── api/               # REST uç noktaları
│   ├── components/            # Paylaşılan UI (shadcn/ui + özel)
│   ├── lib/                   # prisma, redis, rbac, utils
│   ├── server/
│   │   ├── auth/              # NextAuth yapılandırması
│   │   ├── ai/                # Anthropic istemcisi + AI servisleri
│   │   ├── queue/             # BullMQ kuyrukları + worker
│   │   └── services/          # Modül iş mantığı (marka, abonelik...)
│   └── config/                # Sabitler, modül kayıtları
├── docs/                      # Mimari & yol haritası
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## 3. Veritabanı Şeması (Modül Haritası)

`prisma/schema.prisma` içindeki modeller modüllere göre gruplanmıştır:

| Modül | Ana Modeller |
|-------|--------------|
| Kimlik & Erişim | `User`, `Session`, `BrandMember` |
| Marka Yönetimi | `Brand`, `Branch`, `Employee` |
| AI Website Builder | `Website`, `WebsitePage` |
| Google Business / Maps | `GoogleBusinessProfile` |
| Yorum & QR & AI Analiz | `Review`, `QrCode` |
| AI Chatbot | `Chatbot`, `ChatbotKnowledge`, `ChatbotConversation`, `ChatbotMessage` |
| AI İçerik | `ContentItem` |
| Analitik & Dashboard | `AnalyticsEvent`, `DashboardSummary`, `AiUsage` |
| Abonelik & Fatura | `Plan`, `Subscription`, `Invoice` |
| Bildirim | `Notification` |
| Admin / Sistem | `ApiKey`, `SupportTicket`, `SystemSetting`, `AuditLog`, `BackgroundJob` |

**Temel ilişki:** `User 1—N Brand` (sahiplik) ve `User N—M Brand` (`BrandMember` üzerinden üyelik + marka içi rol). Tüm modül verileri `Brand`'a bağlıdır → kiracı izolasyonu.

## 4. Rol Bazlı Yetkilendirme (RBAC)

İki seviye vardır (`src/lib/rbac.ts`):

1. **Global rol** (`GlobalRole`): SUPER_ADMIN, ADMIN, CUSTOMER, STAFF — platform genelinde ne yapabileceğini belirler.
2. **Marka içi rol** (`BrandRole`): OWNER, MANAGER, EDITOR, VIEWER — belirli bir marka içinde ne yapabileceğini belirler.

İzin kontrolü `canGlobal(role, izin)` ve `canBrand(role, izin)` fonksiyonları ile yapılır. Her server action / API uç noktası, işlemi yapmadan önce ilgili izni doğrular.

## 5. Yapay Zekâ Katmanı

Tüm AI modülleri `src/server/ai/` altında toplanır ve ortak `anthropic` istemcisini kullanır. Ağır/uzun süren AI işleri (içerik üretimi, yorum analizi, günlük özet) doğrudan istek-yanıt döngüsünde değil, **BullMQ kuyruğuna** atılır ve worker tarafından işlenir. Bu, panelin akıcı kalmasını sağlar. Kullanım/maliyet `AiUsage` ile izlenir.

## 6. Gerçek Zamanlı Bildirimler

Socket.IO ile kullanıcıya anlık bildirim iletilir. Bildirimler ayrıca `Notification` tablosuna yazılır (uygulama içi geçmiş) ve gerektiğinde e-posta kuyruğuna eklenir.

## 7. Ödeme

Soyut bir ödeme sağlayıcı arayüzü tasarlanır; ilk uygulama **PayTR**, mimari **Stripe**'a da uygundur (`PaymentProvider` enum + `Invoice.providerRef`). Webhook'lar `api/webhooks/*` altında işlenir ve abonelik durumunu günceller.

## 8. Mobil Uyumluluk

API katmanı RESTful tasarlanır ve oturum JWT tabanlıdır; böylece gelecekteki mobil uygulama aynı uç noktaları ve `ApiKey` mekanizmasını kullanabilir.
