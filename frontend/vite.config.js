import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Only include pages that are public, canonical and actually exist.
const publicUrls = ["https://app.ekurl.in/"];
const sitemap = () => ({
  name: "public-sitemap",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "sitemap.xml",
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicUrls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}\n</urlset>\n`,
    });
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), sitemap()],
});
