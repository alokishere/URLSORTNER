import { createServer } from "vite";
import { readFile, writeFile } from "node:fs/promises";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const { renderHome } = await vite.ssrLoadModule("/src/prerender.jsx");
  const file = new URL("../dist/index.html", import.meta.url);
  const html = await readFile(file, "utf8");
  const root = /<div id="root">[\s\S]*?<\/div>/;
  if (!root.test(html)) throw new Error("Could not find prerender root");
  await writeFile(file, html.replace(root, () => `<div id="root" data-prerendered="true">${renderHome()}</div>`));
} finally {
  await vite.close();
}
