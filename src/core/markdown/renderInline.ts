import { escapeHtml } from "./escapeHtml";

/** A link that leaves the site opens in its own tab, and says so to robots. */
function anchor(label: string, href: string): string {
  const external = /^https?:/.test(href);
  const rel = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a href="${escapeHtml(href)}"${rel}>${label}</a>`;
}

function renderMarkup(text: string): string {
  return escapeHtml(text)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) => anchor(label, href))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/ -- /g, " — ");
}

/**
 * Nothing between a pair of backticks is markup any more, so the text is split
 * on code spans and only the gaps are read as markup. Splitting beats hiding
 * the spans behind a placeholder: there is no sentinel to collide with.
 */
export function renderInline(text: string): string {
  return text
    .split(/(`[^`]+`)/g)
    .map((piece) =>
      piece.startsWith("`") && piece.endsWith("`") && piece.length > 1
        ? `<code>${escapeHtml(piece.slice(1, -1))}</code>`
        : renderMarkup(piece),
    )
    .join("");
}
