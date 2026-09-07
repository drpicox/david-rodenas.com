import type { Page, Source } from "./Page";
import { parseFrontMatter } from "./parseFrontMatter";
import { nameOf, parentOf, routeOf } from "./routeOf";

function pageOf(source: Source): Page {
  const { fields, body } = parseFrontMatter(source.markdown);
  const route = routeOf(source.file);
  return {
    file: source.file,
    route,
    parent: parentOf(route),
    name: nameOf(route),
    title: fields["title"] ?? nameOf(route),
    summary: fields["summary"] ?? "",
    order: Number(fields["order"] ?? "100"),
    body,
    fields,
  };
}

function byOrderThenName(a: Page, b: Page): number {
  return a.order - b.order || a.name.localeCompare(b.name);
}

/**
 * Every page, and the two questions the rest of the site asks about them:
 * what is at this address, and what does this directory hold.
 */
export class Site {
  private readonly byRoute: Map<string, Page>;

  constructor(sources: readonly Source[]) {
    const pages = sources.map(pageOf).sort(byOrderThenName);
    this.byRoute = new Map(pages.map((page) => [page.route, page]));
  }

  get pages(): Page[] {
    return [...this.byRoute.values()];
  }

  at(route: string): Page | undefined {
    return this.byRoute.get(route);
  }

  /** What `ls` prints for a directory: its pages, in the author's order. */
  childrenOf(route: string): Page[] {
    return this.pages.filter((page) => page.parent === route).sort(byOrderThenName);
  }

  /** The trail from the root down to a page, the page included. */
  trailTo(route: string): Page[] {
    const page = this.at(route);
    if (!page) return [];
    return page.parent === null ? [page] : [...this.trailTo(page.parent), page];
  }
}
