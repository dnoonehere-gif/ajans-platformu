import { Font } from "@react-pdf/renderer";
import path from "node:path";

/**
 * react-pdf'in varsayılan Helvetica'sında Türkçe glifleri yok; ı→1, ş→_,
 * İ→0, ğ→boş şeklinde bozuluyordu. DejaVu Sans tam Türkçe desteği veriyor
 * ve serbest lisanslı, bu yüzden public/fonts altında repoda taşınıyor.
 */
const FAMILY = "DejaVuSans";

function doRegister() {
  const dir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: FAMILY,
    fonts: [
      { src: path.join(dir, "DejaVuSans.ttf"), fontWeight: "normal" },
      { src: path.join(dir, "DejaVuSans-Bold.ttf"), fontWeight: "bold" },
      { src: path.join(dir, "DejaVuSans-Oblique.ttf"), fontStyle: "italic" },
    ],
  });
  // Türkçe kelimeler yanlış yerden bölünmesin diye tireleme kapatılır
  Font.registerHyphenationCallback((word) => [word]);
}

let registered = false;

export function registerPdfFonts() {
  if (registered) return;
  doRegister();
  registered = true;
}

/**
 * Her renderToBuffer'dan HEMEN ÖNCE çağrılmalı.
 *
 * react-pdf, font subset'ini süreç boyunca paylaşılan tek bir fontkit
 * nesnesinde biriktiriyor. Aynı Node sürecinde (Railway uzun ömürlü) ikinci
 * render'dan itibaren bu birikim ToUnicode/CMap tablosunu bozuyor: görsel
 * çıktı doğru kalıyor ama metin katmanı bozuluyor (kopyala-yapıştır "c"→kontrol
 * karakteri, "U"→"%" gibi; ekran okuyucu ve PDF içi arama da etkileniyor).
 *
 * Aileyi kayıttan silip yeniden kaydetmek, o render'a taze fontkit verisi
 * (boş subset) verir. Aile adı sabit kaldığı için kayıt sözlüğü büyümez.
 */
export function refreshPdfFonts() {
  const reg = Font.getRegisteredFonts() as Record<string, unknown>;
  delete reg[FAMILY];
  doRegister();
}

export const PDF_FONT_FAMILY = FAMILY;
