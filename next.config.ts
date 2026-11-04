import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: let a phone load the dev server through a Cloudflare quick tunnel or the home Wi-Fi.
  allowedDevOrigins: ["*.trycloudflare.com", "192.168.31.144"],
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      {
        source: "/demo",
        destination: "https://drive.google.com/file/d/1hStmygjDwTRZszg2wxtaXcbk221v0JoK/view?usp=sharing",
        permanent: false,
      },
    ];
  },
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
