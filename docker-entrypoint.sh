#!/bin/sh
set -e

echo "🚀 Ajans Platformu başlatılıyor..."

# Veritabanı migration
echo "📦 Migration çalıştırılıyor..."
npx prisma migrate deploy

echo "✅ Hazır."
exec "$@"
