import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Не генерировать apps/web/AGENTS.md при `next dev`: куда смотреть агентам, указано в корневом AGENTS.md.
  agentRules: false,
  transpilePackages: ["@packages/ui", "@packages/contracts", "@packages/shared"],
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/+$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
