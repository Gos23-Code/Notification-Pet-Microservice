import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera .next/standalone (server.js + node_modules mínimos) para que el
  // Dockerfile pueda copiar solo lo necesario en la imagen final.
  output: "standalone",
};

export default nextConfig;
