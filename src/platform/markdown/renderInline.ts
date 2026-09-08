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
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${size}>`;
}

/**
 * The three things that have to be taken in one piece, in the order they win.
 * A code span beats both, because nothing inside one is markup any more; an
 * image beats a link, because a link is what is left of an image once the `!`
 * is gone.
 */
const WHOLE = /(`[^`]+`|!\[[^\]]*\]\([^)\s]+(?:\s+"[^"]*")?\)|\[[^\]]+\]\([^)\s]+\))/g;
const IMAGE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/**
 * First pass: the things that are one thing.
 *
 * A link's label is put back through here, and not through the whole of
 * `renderInline`, which is what lets a code span live inside a label. It also
 * leaves any `**` in the label alone, for the second pass to find.
 */
function structure(text: string): string {
  return text
    .split(WHOLE)
    .map((piece) => {
      if (piece.startsWith("`") && piece.endsWith("`") && piece.length > 1) {
        return `<code>${escapeHtml(piece.slice(1, -1))}</code>`;
      }
      const picture = IMAGE.exec(piece);
      if (picture) return image(picture[1] ?? "", picture[2] ?? "", picture[3]);
      const link = LINK.exec(piece);
      if (link) return anchor(structure(link[1] ?? ""), link[2] ?? "");
      return escapeHtml(piece);
    })
    .join("");
}

/**
 * Second pass: the marks that read straight through the words — bold, italic,
 * the em dash, and where a line breaks.
 *
 * It runs over the whole of the first pass's output rather than piece by
 * piece, so emphasis may hold a link inside it. Only a code span is skipped,
 * and it can be found by its tag because this is the code that wrote it and
 * everything inside one has already been escaped.
 */
function emphasise(html: string): string {
  return html
    .split(/(<code>[\s\S]*?<\/code>)/g)
    .map((piece) =>
      piece.startsWith("<code>")
        ? piece
        : piece
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
            // The lines are joined before the dash is read, because a paragraph is
            // wrapped in the source and about half of the dashes land at the end of
            // a line, where the space that ought to follow is a newline instead.
            .replace(/ {2,}\n/g, "<br>")
            .replace(/\n/g, " ")
            .replace(/ -- /g, " — "),
    )
    .join("");
}

/**
 * The words of a line, marked up.
 *
 * Two passes, because one cannot do it. Reading the marks first would read
 * them inside code spans; splitting on code spans first cut a link whose label
 * held one into halves that no longer looked like a link, which is what
 * `[`compile.js`](…)` used to do. So: take the whole things first, then read
 * the marks over what comes out.
 */
export function renderInline(text: string): string {
  return emphasise(structure(text));
}
