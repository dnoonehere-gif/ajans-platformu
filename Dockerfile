# ─────────────────────────────────────────────────────────────────────────────
#  Aşama 1: Bağımlılıklar
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
# --legacy-peer-deps: shadcn/radix uyumluluğu için
RUN npm ci --legacy-peer-deps

# ─────────────────────────────────────────────────────────────────────────────
#  Aşama 2: Build
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma client üret
RUN npx prisma generate

# Build — env stub'ları (gerçek değerler runtime'da gelecek)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/ajans"
ENV AUTH_SECRET="build-time-placeholder-secret-min-32-chars"
ENV NEXTAUTH_URL="http://localhost:3000"

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
#  Aşama 3: Runner (minimal imaj)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Güvenlik: root olmayan kullanıcı
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone build çıktısı
COPY --from=builder /app/public          ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static    ./.next/static
COPY --from=builder /app/prisma          ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Migration çalıştırmak için prisma CLI
COPY --from=builder /app/node_modules/prisma        ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma        ./node_modules/@prisma

# Başlatma scripti
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
