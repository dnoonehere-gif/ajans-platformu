/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Üretimde duraksamasız Docker imajı için
  output: "standalone",
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
};
export default nextConfig;
