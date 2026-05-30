import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.1.255.235', 'localhost:3003'],
  reactCompiler: true,
};

export default nextConfig;
