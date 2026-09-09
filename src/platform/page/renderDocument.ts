import type { Page } from "../content/Page";
import type { Site } from "../content/Site";
import { escapeHtml } from "../markdown/escapeHtml";
import { declaredAppearance } from "./declaredAppearance";
import { promptPath } from "../shell/promptPath";
import { bookSchema } from "./bookSchema";
import { isHere } from "./isHere";
import { renderMain } from "./renderMain";

export interface DocumentAssets {
  /** Emitted by the bundler, injected here so this stays a pure function. */
  readonly script?: string;
  readonly stylesheet?: string;
  readonly origin: string;
}

/**
 * The output of `ls` at the root, as the navigation: README.md, which is the
 * home page, and then the directories. Adding a page at the root is adding it
 * to the navigation, and the header says which command would have printed it.
 */
function nav(site: Site, current: string): string {
  const entries = [
    { route: "/", name: "README.md" },
    ...site.childrenOf("/").map(({ route, name }) => ({ route, name: `${name}/` })),
  ];
  const links = entries
    .map(({ route, name }) => {
      const here = isHere(current, route) ? ' aria-current="page"' : "";
      return `<a class="navlink" href="${route}"${here}>${escapeHtml(name)}</a>`;
    })
    .join("");
  return `<p class="ran"><a class="brand" href="/">@drpicox</a> <span class="ps1">~ $</span> ls</p>
    <nav>${links}</nav>`;
}

/**
 * A page may insist on a theme and a sky: `theme: dark`, `sky: stars`. Most do
 * not. `data-theme` is written as well as `data-page-theme`, because the first
 * paint happens before any script has had a chance to settle the two.
 */
function rootAttributes(page: Page): string {
  const declared = declaredAppearance(page);
  const forced = declared["data-page-theme"];
  const written = { ...(forced ? { "data-theme": forced } : {}), ...declared };
  return Object.entries(written)
    .map(([name, value]) => ` ${name}="${escapeHtml(value)}"`)
    .join("");
}

/**
 * The prompt is real: a script wires it to the shell, over this same content.
 * Until then it stays hidden, because a prompt that does nothing is a lie.
 *
 * It is the last line of the page, outside the column, so that it can stay at
 * hand at the bottom of the window while the page scrolls under it and land
 * in its place when the page runs out. The cursor is drawn here rather than
 * by the input: a terminal's cursor is a block, and it is there before you
 * click. The suggestion is what to type first. The grip along the top edge
 * is where a hand takes the screen and makes it as tall as it likes.
 */
function terminal(page: Page): string {
  return `<section class="terminal" hidden>
<div class="grip" title="Drag to resize the terminal. Double-click to reset."></div>
<div class="column">
<div class="screen" aria-live="polite"></div>
<form class="prompt"><span class="ps1">${escapeHtml(promptPath(page.route))} $</span><span class="line"><input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Command"><span class="cursor" aria-hidden="true"></span><span class="suggest" aria-hidden="true">help</span></span></form>
</div>
</section>`;
}

/**
 * A page, whole, as a string. It is a pure function of the content so the
 * build can call it in node and get exactly what a browser would have built —
 * except that here the words are in the file, which is the entire point.
 */
export function renderDocument(site: Site, page: Page, assets: DocumentAssets): string {
  const title = page.route === "/" ? "David Rodenas" : `${page.title} — David Rodenas`;
  const description = page.summary || "David Rodenas, PhD. I lay the foundations other engineers build on.";
  const canonical = `${assets.origin}${page.route}`;
  const stylesheet = assets.stylesheet ? `<link rel="stylesheet" href="${assets.stylesheet}">` : "";
  const script = assets.script ? `<script type="module" src="${assets.script}"></script>` : "";

  return `<!doctype html>
<html lang="en"${rootAttributes(page)}>
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
<link rel="icon" type="image/png" href="/favicon.png">
<script>try{var h=document.documentElement,t=localStorage.getItem("theme");if(!h.dataset.pageTheme&&(t==="light"||t==="dark"))h.dataset.theme=t}catch(e){}
(function(){var k=[];window.__typed=k;function h(e){var f=e.target&&e.target.matches&&e.target.matches("input,textarea,select,[contenteditable]");if(f||e.metaKey||e.ctrlKey||e.altKey)return;if(e.key.length===1||e.key==="Enter"||e.key==="Backspace"){k.push(e.key);e.preventDefault()}}window.addEventListener("keydown",h);window.__stopTyped=function(){window.removeEventListener("keydown",h)}})()</script>
${bookSchema(page, assets.origin)}
${stylesheet}
</head>
<body>
<div class="container">
<header class="site-header">
  <a class="mark" href="/" aria-label="Home">
    <canvas class="planet" width="160" height="160" aria-hidden="true"></canvas>
  </a>
  <div>
    ${nav(site, page.route)}
  </div>
  <button class="theme-toggle" type="button" aria-hidden="true" tabindex="-1" aria-label="Switch theme" title="theme">&#9680;</button>
</header>
<main>
${renderMain(site, page)}
</main>
<footer class="site-footer">
  <span>&copy; 2026 David Rodenas</span>
  <span class="social"><a href="https://github.com/drpicox" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://drpicox.medium.com" target="_blank" rel="noopener noreferrer">Medium</a><a href="https://www.linkedin.com/in/davidrodenas/" target="_blank" rel="noopener noreferrer">LinkedIn</a></span>
</footer>
</div>
${terminal(page)}
${script}
<script data-goatcounter="https://drpicox.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</body>
</html>
`;
}
