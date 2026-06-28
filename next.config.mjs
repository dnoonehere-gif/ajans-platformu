/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
    // Partial Prerendering — statik shell + dynamic stream
    ppr: false, // Next 15'te deneysel, stable olunca açılacak
    // optimizePackageImports: büyük kütüphaneleri tree-shake et
    optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-accordion",
      "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs"],
  },

  // Image optimizasyon
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 3600,
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // logo URL'leri için
    ],
  },

  // HTTP sıkıştırma
  compress: true,

  // Webpack optimizasyonları
  webpack(config, { isServer }) {
    // SVG'leri React component'e çevir
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Server bundle'ından client-only paketleri dışla
    if (isServer) {
      config.externals = [...(config.externals ?? []), "canvas", "jsdom"];
    }

    return config;
  },

  // HTTP response header'ları (middleware de ekliyor, burada CDN katmanı için)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Statik asset'ler için uzun cache
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Font dosyaları
        source: "/fonts/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // Public resimler
        source: "/:path*.{png,jpg,jpeg,gif,webp,avif,svg,ico}",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=3600" }],
      },
    ];
  },

  // Redirect'ler
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
