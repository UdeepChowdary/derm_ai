import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Derm AI",
    short_name: "Derm AI",
    description: "AI-powered dermatology assistant for skin health analysis",
    start_url: "/",
    display: "standalone",
    background_color: "#f0fdfa",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/android-adaptive-foreground.png",
        sizes: "432x432",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/screenshot1.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Derm AI Home Screen",
      },
      {
        src: "/screenshots/screenshot2.png",
        sizes: "1080x1920",
        type: "image/png",
        form_factor: "narrow",
        label: "Skin Analysis Report",
      },
    ],
  }
}
