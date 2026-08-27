import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loki Bar",
    short_name: "Loki",
    description: "Premium venue portal for Loki Bar in Dhaka.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#060606",
    theme_color: "#060606",
    categories: ["business", "lifestyle", "productivity"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon-1024.png", sizes: "1024x1024", type: "image/png", purpose: "any" },
      { src: "/icon-1024.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
    ],
  }
}
