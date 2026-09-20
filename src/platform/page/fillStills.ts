const PLACE = /<div class="app" data-app="([a-z0-9-]+)"><\/div>/g;

/**
 * A program draws when the script runs; a still is what stands in its place
 * until then, and for every reader the script never runs for. The founding
 * rule is that the content is in the HTML, and a figure made of data is
 * content. Done over the finished document rather than inside the markdown
 * renderer, because the renderer also runs in the browser, where the program
 * itself is about to draw and the data is not at hand.
 */
export function fillStills(html: string, stillOf: (name: string) => string | undefined): string {
  return html.replace(PLACE, (place, name: string) => {
    try {
      const still = stillOf(name);
      return still === undefined ? place : place.replace("></div>", `>${still}</div>`);
    } catch {
      return place;
    }
  });
}
