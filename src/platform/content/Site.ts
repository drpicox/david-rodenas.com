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

function withSlash(route: string): string {
  return route.endsWith("/") ? route : `${route}/`;
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
  /** By the address each link stands at: the link's own entry, whose `route` is where it leads. */
  private readonly linked: Map<string, Page>;

  constructor(sources: readonly Source[]) {
    const all = sources.map(pageOf);
    const pages = all.filter((page) => !page.fields["link"]).sort(byOrderThenName);
    this.byRoute = new Map(pages.map((page) => [page.route, page]));
    // A link is a page standing in a second directory: listed there under its own name and order, and nothing else of its own.
    this.linked = new Map(
      all.flatMap((link) => {
        const target = this.byRoute.get(withSlash(link.fields["link"] ?? ""));
        if (!link.fields["link"] || !target) return [];
        return [[link.route, { ...target, parent: link.parent, name: link.name, order: link.order, link: link.route }] as const];
      }),
    );
  }

  /** Where every link leads, so the build can leave the way there at the link's own address. */
  get links(): { from: string; to: string }[] {
    return [...this.linked.values()].map((entry) => ({ from: entry.link!, to: entry.route }));
  }

  get pages(): Page[] {
    return [...this.byRoute.values()];
  }

  /** A link's address answers with the page it leads to, so `cd` and `cat` follow it as a shell would. */
  at(route: string): Page | undefined {
    const link = this.linked.get(route);
    return this.byRoute.get(link ? link.route : route);
  }

  /** What `ls` prints for a directory: its pages, in the author's order. */
  childrenOf(route: string): Page[] {
    return [...this.pages, ...this.linked.values()].filter((page) => page.parent === route).sort(byOrderThenName);
  }

  /** The trail from the root down to a page, the page included. */
  trailTo(route: string): Page[] {
    const page = this.at(route);
    if (!page) return [];
    return page.parent === null ? [page] : [...this.trailTo(page.parent), page];
  }
}
