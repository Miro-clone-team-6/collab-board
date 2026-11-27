import { resolve } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: resolve(import.meta.dirname, "../.."),
  reactStrictMode: true,
  typedRoutes: true,
  // Не генерировать apps/web/AGENTS.md при `next dev`: куда смотреть агентам, указано в корневом AGENTS.md.
  agentRules: false,
  transpilePackages: ["@packages/ui", "@packages/contracts", "@packages/shared"],
  async rewrites() {
    const apiUrl =
      process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl.replace(/\/+$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
