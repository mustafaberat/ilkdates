import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/login", destination: "/giris", permanent: true },
      { source: "/signup", destination: "/kayit", permanent: true },
    ];
  },
};

export default nextConfig;
