import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EchoTale",
    short_name: "EchoTale",
    description: "Upload PDF books and listen as AI-generated audiobooks.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#100c25",
    theme_color: "#100c25",
    orientation: "portrait",
    icons: [
      {
        src: "/echotale-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
