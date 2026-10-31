import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: let a phone load the dev server through a Cloudflare quick tunnel or the home Wi-Fi.
  allowedDevOrigins: ["*.trycloudflare.com", "192.168.31.144"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
