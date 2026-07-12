#!/bin/sh

echo "Ajans Platformu baslatiliyor..."

echo "Veritabani semasi guncelleniyor..."
npx prisma db push --skip-generate --accept-data-loss 2>&1 || echo "UYARI: prisma db push basarisiz oldu, devam ediliyor..."

echo "Hazir."
exec "$@"
