#!/bin/sh
set -e

echo "🚀 Ajans Platformu başlatılıyor..."

# Veritabanı şemasını senkronize et
echo "📦 Veritabanı şeması güncelleniyor..."
npx prisma db push --skip-generate

echo "✅ Hazır."
exec "$@"
