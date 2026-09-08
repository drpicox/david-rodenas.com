import type { Page } from "../content/Page";

/**
 * The `data-*` a page's front matter asks the root element to carry.
 *
 * This is the one place the frame names a field that belongs to a feature,
 * and it is here because of the requirement that outranks the folder layout:
 * a page that insists on night has to be night in the HTML, before a
 * stylesheet paints and long before a script runs. So the document writes
 * these, the navigation keeps them in step across a move, and the features
 * read them back off the root. Nothing else in the frame knows what `dark` or
 * `stars` mean.
 */
export function declaredAppearance(page: Page): Record<string, string> {
  const declared: Record<string, string> = {};
  const theme = page.fields["theme"];
  if (theme === "dark" || theme === "light") declared["data-page-theme"] = theme;
  const sky = page.fields["sky"];
  if (sky) declared["data-sky"] = sky;
  return declared;
}

/** Every attribute the above can write, so that whoever moves between pages can clear the rest. */
export const APPEARANCE = ["data-page-theme", "data-sky"] as const;
