# Deployment Rehberi

## 1. Vercel (Önerilen — Hızlı)

### Adımlar
1. [vercel.com](https://vercel.com) → New Project → GitHub repo'yu import et
2. Framework: **Next.js** (otomatik algılar)
3. Build Command: `npx prisma generate && npm run build`
4. Install Command: `npm install --legacy-peer-deps`

### Environment Variables (Vercel Dashboard'dan ekle)
```
DATABASE_URL=postgresql://...supabase.com:5432/postgres
REDIS_URL=redis://...upstash.io:6379
AUTH_SECRET=<openssl rand -base64 32 ile üret>
NEXTAUTH_URL=https://ajansplatformu.com
ANTHROPIC_API_KEY=sk-ant-...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
CRON_SECRET=<random secret>
```

### Vercel + Upstash Redis
1. Vercel Marketplace → Upstash Redis ekle → REDIS_URL otomatik gelir

### Vercel + Supabase PostgreSQL
1. Supabase Dashboard → Settings → Database → Connection string → Transaction pooler URL'ini kullan
2. URL sonuna ekle: `?pgbouncer=true&connection_limit=1`

---

## 2. Docker (Self-hosted VPS)

### Gereksinimler
- Ubuntu 22.04+ VPS (min 2GB RAM)
- Docker + Docker Compose

### Kurulum
```bash
# 1. Repo'yu clone et
git clone https://github.com/dnoonehere-gif/ajans-platformu.git
cd ajans-platformu

# 2. .env dosyasını oluştur
cp .env.example .env
nano .env   # Gerçek değerleri gir

# 3. SSL sertifikası (Let's Encrypt)
mkdir -p nginx/certs
# Cloudflare Origin sertifikası veya certbot kullan

# 4. Servisleri başlat
docker compose up -d

# 5. İlk migration
docker compose exec app npx prisma migrate deploy

# 6. Planları seed et
curl -X POST https://ajansplatformu.com/api/plans/seed \
  -H "Cookie: <admin session cookie>"
```

### Güncelleme
```bash
git pull
docker compose build --no-cache app worker
docker compose up -d --no-deps app worker
docker compose exec app npx prisma migrate deploy
```

### Loglar
```bash
docker compose logs -f app
docker compose logs -f worker
docker compose logs -f nginx
```

---

## 3. Cloudflare Entegrasyonu

### DNS
```
A    ajansplatformu.com    <VPS IP>    Proxied ✓
A    www                   <VPS IP>    Proxied ✓
```

### Page Rules / Cache Rules
- `ajansplatformu.com/_next/static/*` → Cache Everything, Edge TTL: 1 year
- `ajansplatformu.com/api/*` → Bypass Cache
- `ajansplatformu.com/api/notifications/stream` → Bypass Cache, Disable Buffering

### Firewall Rules
- Rate limit: `/api/auth/*` → 10 req/min per IP
- Block: User-Agent contains known bots

### SSL/TLS
- Mode: **Full (strict)** — Cloudflare ↔ Origin arası da SSL

### Cloudflare Tunnel (VPS IP gizlemek için)
```bash
# Sunucuya cloudflared kur
cloudflared tunnel create ajans
cloudflared tunnel route dns ajans ajansplatformu.com
cloudflared tunnel run ajans
```

---

## 4. Sağlık Kontrolü

```bash
curl https://ajansplatformu.com/api/health
# {"status":"ok","uptime":1234,"checks":{"db":{"ok":true,"ms":5},"redis":{"ok":true,"ms":2}}}
```

## 5. Cron Jobs (Vercel)

`vercel.json` içinde tanımlı:
- `/api/cron/subscription-check` → Her gün 09:00 UTC
  - Süresi dolan abonelikleri EXPIRED yapar
  - 3 gün kalan aboneliklere uyarı gönderir

`CRON_SECRET` environment variable gereklidir.
