import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Workspace packages are plain TypeScript sources at dev time; Next
  // compiles them together with the app instead of requiring a prebuilt bundle.
  transpilePackages: ['@collab-board/shared'],
};

export default nextConfig;
