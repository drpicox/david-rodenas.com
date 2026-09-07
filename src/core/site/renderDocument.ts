import type { Page } from "../content/Page";
import type { Site } from "../content/Site";
import { escapeHtml } from "../markdown/escapeHtml";
import { renderMarkdown } from "../markdown/renderMarkdown";

export interface DocumentAssets {
  /** Emitted by the bundler, injected here so this stays a pure function. */
  readonly script?: string;
  readonly stylesheet?: string;
  readonly origin: string;
}

const NAV = [
  { route: "/work/", label: "WORK" },
  { route: "/code/", label: "CODE" },
  { route: "/writing/", label: "WRITING" },
];

function nav(current: string): string {
  return NAV.map(({ route, label }) => {
    const here = current === route || current.startsWith(route) ? ' aria-current="page"' : "";
    return `<a class="navlink" href="${route}"${here}>${label}</a>`;
  }).join("");
}

/** A directory prints what it holds; a page prints nothing here. */
function listing(site: Site, page: Page): string {
  const children = site.childrenOf(page.route);
  if (children.length === 0) return "";
  const items = children
    .map(
      (child) =>
        `<li><a href="${child.route}">${escapeHtml(child.title)}</a>` +
        (child.summary ? ` <span class="summary">${escapeHtml(child.summary)}</span>` : "") +
        `</li>`,
    )
    .join("");
  return `<ul class="listing">${items}</ul>`;
}

function trail(site: Site, page: Page): string {
  const steps = site.trailTo(page.route);
  if (steps.length <= 1) return "";
  const path = steps
    .slice(1)
    .map((step) => step.name)
    .join("/");
  return `<p class="ran"><span class="ps1">~ $</span> cd ${escapeHtml(path)} &amp;&amp; cat *</p>`;
}

/**
 * A page, whole, as a string. It is a pure function of the content so the
 * build can call it in node and get exactly what a browser would have built —
 * except that here the words are in the file, which is the entire point.
 */
export function renderDocument(site: Site, page: Page, assets: DocumentAssets): string {
  const title = page.route === "/" ? "David Rodenas" : `${page.title} — David Rodenas`;
  const description = page.summary || "David Rodenas, PhD. I build the foundations other engineers build on.";
  const canonical = `${assets.origin}${page.route}`;
  const stylesheet = assets.stylesheet ? `<link rel="stylesheet" href="${assets.stylesheet}">` : "";
  const script = assets.script ? `<script type="module" src="${assets.script}"></script>` : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta name="twitter:card" content="summary">
${stylesheet}
</head>
<body>
<div class="container">
<header class="site-header">
  <a class="mark" href="/" aria-label="Home">
    <canvas class="planet" width="160" height="160" aria-hidden="true"></canvas>
  </a>
  <div>
    <a class="brand" href="/">@drpicox</a>
    <nav>${nav(page.route)}</nav>
  </div>
</header>
<main>
${trail(site, page)}
${renderMarkdown(page.body)}
${listing(site, page)}
</main>
<footer class="site-footer">
  <span>&copy; 2026 David Rodenas</span>
  <span class="spacer"></span>
  <a href="https://github.com/drpicox">GitHub</a>
  <a href="https://drpicox.medium.com">Medium</a>
  <a href="https://www.linkedin.com/in/davidrodenas/">LinkedIn</a>
</footer>
</div>
${script}
</body>
</html>
`;
}
