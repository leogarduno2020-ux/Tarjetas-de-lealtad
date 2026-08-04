import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // El build de Vercel no debe caerse por reglas de estilo.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
