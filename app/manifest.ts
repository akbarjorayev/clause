import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clause: check your work contract",
    short_name: "Clause",
    description: "Check a work contract or payslip against the labour law of the country you work in.",
    start_url: "/",
    display: "standalone",
    background_color: "#e8edf2",
    theme_color: "#ed5901",
    icons: [
      { src: "/logo-192.webp", sizes: "192x192", type: "image/webp" },
      { src: "/logo.webp", sizes: "512x512", type: "image/webp" },
      { src: "/logo.webp", sizes: "512x512", type: "image/webp", purpose: "maskable" },
    ],
  };
}
