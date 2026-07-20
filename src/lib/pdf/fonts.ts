import { Font } from "@react-pdf/renderer";
import path from "node:path";

/**
 * react-pdf'in varsayılan Helvetica'sında Türkçe glifleri yok; ı→1, ş→_,
 * İ→0, ğ→boş şeklinde bozuluyordu. DejaVu Sans tam Türkçe desteği veriyor
 * ve serbest lisanslı, bu yüzden public/fonts altında repoda taşınıyor.
 */
let registered = false;

export function registerPdfFonts() {
  if (registered) return;
  const dir = path.join(process.cwd(), "public", "fonts");
  Font.register({
    family: "DejaVuSans",
    fonts: [
      { src: path.join(dir, "DejaVuSans.ttf"), fontWeight: "normal" },
      { src: path.join(dir, "DejaVuSans-Bold.ttf"), fontWeight: "bold" },
      { src: path.join(dir, "DejaVuSans-Oblique.ttf"), fontStyle: "italic" },
    ],
  });
  // Türkçe kelimeler yanlış yerden bölünmesin diye tireleme kapatılır
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}

export const PDF_FONT_FAMILY = "DejaVuSans";
