import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // Necessario per UploadThing
      },
    ],
  },
  // Rimuovi eslint e typescript da qui se ti danno warning, 
  // Next.js 15+ li gestisce diversamente.
  // Se vuoi ignorare gli errori di build TypeScript, usa questa sintassi:
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;