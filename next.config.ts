import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.thesportsdb.com",
      },
    ],
  },
  // 舊版路徑永久重定向配置
  // Legacy path permanent redirects configuration
  async redirects() {
    return [
      {
        // /events → /event (保留查詢參數)
        // /events → /event (preserve query parameters)
        source: "/events",
        destination: "/event",
        permanent: true, // 308 永久重定向
      },
      {
        // /events/:id → /event/:id
        source: "/events/:id",
        destination: "/event/:id",
        permanent: true, // 308 永久重定向
      },
    ];
  },
};

export default nextConfig;
