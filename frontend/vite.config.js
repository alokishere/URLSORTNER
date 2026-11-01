import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolveConfig } from "./src/config/env.js";

export default defineConfig(({ mode }) => {
  const config = resolveConfig({ ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env, PROD: mode === 'production' });
  return {
    plugins: [react(), tailwindcss(), {
      name: 'public-metadata',
      transformIndexHtml: { order: 'pre', handler: html => html.replaceAll('%VITE_FRONTEND_URL%', config.frontendUrl) },
      generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${config.frontendUrl}/</loc></url></urlset>\n` });
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${config.frontendUrl}/sitemap.xml\n` });
      },
    }],
  };
});
