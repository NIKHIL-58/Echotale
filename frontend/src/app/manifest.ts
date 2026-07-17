import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EchoTale",
    short_name: "EchoTale",
    description: "Upload PDF books and listen as AI-generated audiobooks.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0b0920",
    theme_color: "#0b0920",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
