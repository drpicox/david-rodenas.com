import type { Page } from "../content/Page";

/**
 * The book exists in no library catalogue, so this page is its record. The
 * fields come from the front matter; anything the page does not state is not
 * claimed here either.
 */
export function bookSchema(page: Page, origin: string): string {
  const isbn = page.fields["isbn"];
  if (!isbn) return "";

  const pages = Number(page.fields["pages"]);
  const cover = page.fields["cover"];
  const book = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: page.title,
    author: { "@type": "Person", name: "David Rodenas", url: origin },
    isbn,
    url: `${origin}${page.route}`,
    ...(page.fields["published"] ? { datePublished: page.fields["published"] } : {}),
    ...(Number.isFinite(pages) && pages > 0 ? { numberOfPages: pages } : {}),
    ...(cover ? { image: `${origin}${cover}` } : {}),
    inLanguage: "en",
  };
  // `<` cannot appear inside a script element without ending it early.
  return `<script type="application/ld+json">${JSON.stringify(book).replace(/</g, "\\u003c")}</script>`;
}
