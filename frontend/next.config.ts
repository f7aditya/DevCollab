import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests for HMR from this IP
  allowedDevOrigins: ['10.10.10.211'],
  /* config options here */
};

export default nextConfig;
