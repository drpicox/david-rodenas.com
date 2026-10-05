import { escapeHtml } from "../markdown/escapeHtml";

/** Markup that can go into a page as it is: made by tag, or handed over whole by whoever made it so. */
export interface Markup {
  readonly html: string;
}

type Child = Markup | string | number | null | undefined | false;
/** Children as a map over rows gives them, lists in lists however deep. */
type Children = Child | readonly Children[];
type Attribute = string | number | boolean | null | undefined;

const markupOf = (child: Children): string => {
  if (child === null || child === undefined || child === false) return "";
  if (Array.isArray(child)) return child.map(markupOf).join("");
  return typeof child === "object" ? (child as Markup).html : escapeHtml(String(child));
};

/**
 * One element of markup, and everything in it. Words are always escaped and
 * markup never is, so a picture drawn from data — a station's name, a file's
 * path — cannot become markup on the way into a page.
 */
export function tag(name: string, attributes: Readonly<Record<string, Attribute>> = {}, ...children: readonly Children[]): Markup {
  const written = Object.entries(attributes)
    .flatMap(([key, value]) => (value === undefined || value === null || value === false ? [] : value === true ? [` ${key}`] : [` ${key}="${escapeHtml(String(value))}"`]))
    .join("");
  const inside = children.map(markupOf).join("");
  return { html: `<${name}${written}>${inside}</${name}>` };
}
