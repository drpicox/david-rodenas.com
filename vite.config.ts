/// <reference types="vitest/config" />
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig, type Plugin } from "vite";
import { Site } from "./src/platform/content/Site";
import { renderDocument } from "./src/platform/page/renderDocument";

const CONTENT = "content";
const ORIGIN = "https://david-rodenas.com";
const VIRTUAL_SITE = "virtual:site";

function sourcesIn(directory: string): { file: string; markdown: string }[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourcesIn(path);
    if (!entry.name.endsWith(".md")) return [];
    return [{ file: relative(CONTENT, path), markdown: readFileSync(path, "utf8") }];
  });
}

function readSite(): Site {
  return new Site(sourcesIn(CONTENT));
}

/**
 * One HTML file per markdown file, written at build time.
 *
 * The whole site is a pure function of `content/`, so the plugin only has to
 * decide when to call it: on every request in dev, and once per page in build.
 */
function site(): Plugin {
  return {
    name: "site",

    // The browser gets the same markdown the build saw, so the shell there
    // answers `ls` and `cat` from the very content the pages were made of.
    resolveId(id) {
      return id === VIRTUAL_SITE ? `\0${VIRTUAL_SITE}` : null;
    },
    load(id) {
      if (id !== `\0${VIRTUAL_SITE}`) return null;
      return `export const sources = ${JSON.stringify(sourcesIn(CONTENT))};`;
    },

    configureServer(server) {
      server.watcher.add(CONTENT);
      // Adding a page counts, and so does removing one. Watching only `change`
      // meant a new markdown file was served as a page while the shell in the
      // browser still said `cd: no such directory`, until the server restarted.
      for (const event of ["change", "add", "unlink"] as const) {
        server.watcher.on(event, (path) => {
          if (!path.includes(`/${CONTENT}/`)) return;
          const cached = server.moduleGraph.getModuleById(`\0${VIRTUAL_SITE}`);
          if (cached) server.moduleGraph.invalidateModule(cached);
          server.ws.send({ type: "full-reload" });
        });
      }
      server.middlewares.use((request, response, next) => {
        const route = (request.url ?? "/").split("?")[0] ?? "/";
        const withSlash = route.endsWith("/") ? route : `${route}/`;
        const page = readSite().at(withSlash);
        if (!page) return next();

        const html = renderDocument(readSite(), page, {
          origin: ORIGIN,
          stylesheet: "/src/styles.css",
          script: "/src/main.ts",
        });
        server.transformIndexHtml(withSlash, html).then((transformed) => {
          response.setHeader("Content-Type", "text/html");
          response.end(transformed);
        }, next);
      });
    },

    // The entry is bundled first; only then are the asset names known.
    generateBundle(_options, bundle) {
      const entry = Object.values(bundle).find((file) => file.type === "chunk" && file.isEntry);
      const stylesheet = Object.keys(bundle).find((name) => name.endsWith(".css"));
      const assets = {
        origin: ORIGIN,
        script: entry ? `/${entry.fileName}` : undefined,
        stylesheet: stylesheet ? `/${stylesheet}` : undefined,
      };

      const built = readSite();
      for (const page of built.pages) {
        this.emitFile({
          type: "asset",
          fileName: `${page.route.slice(1)}index.html`,
          source: renderDocument(built, page, assets),
        });
      }

      // GitHub Pages serves this for anything it cannot find.
      const home = built.at("/");
      if (home) {
        this.emitFile({ type: "asset", fileName: "404.html", source: renderDocument(built, home, assets) });
      }

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: sitemapOf(built.pages.map((page) => page.route)),
      });
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`,
      });
    },
  };
}

function sitemapOf(routes: readonly string[]): string {
  const urls = routes.map((route) => `  <url><loc>${ORIGIN}${route}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export default defineConfig({
  plugins: [site()],
  build: {
    outDir: "dist",
    rollupOptions: { input: "src/main.ts" },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
