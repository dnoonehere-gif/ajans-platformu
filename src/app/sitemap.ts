import type { MetadataRoute } from "next";

const BASE = "https://www.novelya.com.tr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, freq: "weekly" },
    { path: "/fiyatlar", priority: 0.9, freq: "weekly" },
    { path: "/hakkimizda", priority: 0.7, freq: "monthly" },
    { path: "/iletisim", priority: 0.7, freq: "monthly" },
    { path: "/sss", priority: 0.6, freq: "monthly" },
    { path: "/kullanim-sartlari", priority: 0.3, freq: "yearly" },
    { path: "/gizlilik", priority: 0.3, freq: "yearly" },
    { path: "/kvkk", priority: 0.3, freq: "yearly" },
    { path: "/cerez-politikasi", priority: 0.3, freq: "yearly" },
    { path: "/iade-politikasi", priority: 0.3, freq: "yearly" },
  ];

  return pages.map((p) => ({
    url: `${BASE}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
