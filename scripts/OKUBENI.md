# Pazarlama görselleri

Üretilmiş dosyalar `pazarlama/` altında, depoya dahil — iki bilgisayarda da
`git pull` ile gelir, yeniden üretmeye gerek yoktur.

## Yeniden üretmek gerekirse

Fiyat veya metin değişince görselleri yenilemek için üretici betikler
kullanılır. Betikler `sharp` (zaten bağımlılıkta) ve video için
`ffmpeg-static` ister:

```bash
npm i ffmpeg-static --no-save --legacy-peer-deps
```

`--no-save` bilinçli: ffmpeg yalnızca görsel üretiminde lazım, uygulamanın
çalışma zamanı bağımlılığı değil. `package.json`'a eklenmemeli.

## Dikkat

- Fiyatlar betiklerde TEK bir sabitten gelir. Fiyat değişince önce o sabiti
  güncelle, sonra çalıştır — yoksa bazı görsellerde eski fiyat kalır.
- `librsvg` (sharp'ın SVG motoru) `foreignObject` DESTEKLEMEZ. Uzun metinleri
  elle satırlara bölmek gerekir; aksi hâlde metin sessizce kaybolur.
- Video kareleri geçici bir klasöre yazılıp ffmpeg ile birleştirilir; iş
  bitince klasör silinir.
