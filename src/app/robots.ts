import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Yönetim paneli yolu KASITLI olarak yazılmaz: robots.txt herkese açıktır,
        // gizli yolu buraya koymak onu ilan etmek olur. Panel zaten middleware'de
        // rol kontrolüyle korunuyor.
        disallow: ["/dashboard", "/api/"],
      },
    ],
    sitemap: "https://www.novelya.com.tr/sitemap.xml",
  };
}
