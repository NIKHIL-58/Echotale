import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
 return { name: "EchoTale", short_name: "EchoTale", description: "Your personal space for reading and listening to stories.", start_url: "/", scope: "/", display: "standalone", background_color: "#f8f7fa", theme_color: "#19132d", icons: [
  {src: "/echotale-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any"},
  {src: "/echotale-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any"},
  {src: "/echotale-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable"},
  {src: "/echotale-mark.svg", sizes: "any", type: "image/svg+xml", purpose: "any"}
 ] };
}
