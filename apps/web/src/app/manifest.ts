import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ideator.dev",
    short_name: "ideator.dev",
    description: "Find, combine, and pressure-test product ideas before you build them.",
    start_url: "/app",
    display: "standalone",
    background_color: "#1d3440",
    theme_color: "#1d3440",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
