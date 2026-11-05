import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /watched share image reads these fonts from disk
  outputFileTracingIncludes: {
    "/watched/og": ["./app/watched/og/fonts/*"],
  },
};

export default nextConfig;
