import type { Site } from "../content/Site";

export interface FormerAddress {
  readonly from: string;
  readonly to: string;
}

/**
 * A page that moves says where it was — `was: /code/` in its front matter,
 * several separated by commas — and the old address goes on leading to it.
 * Links from outside cannot be edited, and a moved page should not cost the
 * reader who followed one.
 */
export function formerAddresses(site: Site): FormerAddress[] {
  return site.pages.flatMap((page) =>
    (page.fields["was"] ?? "")
      .split(",")
      .map((address) => address.trim())
      .filter(Boolean)
      .map((address) => (address.endsWith("/") ? address : `${address}/`))
      .filter((from) => !site.at(from))
      .map((from) => ({ from, to: page.route })),
  );
}
