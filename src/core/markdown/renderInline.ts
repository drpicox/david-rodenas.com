import { escapeHtml } from "./escapeHtml";

/** A link that leaves the site opens in its own tab, and says so to robots. */
function anchor(label: string, href: string): string {
  const external = /^https?:/.test(href);
  const rel = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `<a href="${escapeHtml(href)}"${rel}>${label}</a>`;
}

const SIZES = ["large", "wide"];

/** The title of an image is where its size goes: `"large"` or `"wide"`. Any other title is left alone. */
function image(alt: string, src: string, title?: string): string {
  const size = title && SIZES.includes(title) ? ` class="${title}"` : "";
  return `<img src="${escapeHtml(src)}" alt="${alt}"${size}>`;
}

/** An image is read before a link, because a link is what is left of it once the `!` is gone. */
function renderMarkup(text: string): string {
  return escapeHtml(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_match, alt: string, src: string, title?: string) =>
      image(alt, src, title),
    )
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, href: string) => anchor(label, href))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/ -- /g, " — ")
    .replace(/ {2,}\n/g, "<br>")
    .replace(/\n/g, " ");
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
