import { describe, expect, it } from "vitest";
import { renderRedirect } from "./renderRedirect";

describe("what stands at an address a page has left", () => {
  const html = renderRedirect("/open-source/", "https://example.test");

  it("sends a browser on at once, and a search engine to the address to keep", () => {
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/open-source/">');
    expect(html).toContain('<link rel="canonical" href="https://example.test/open-source/">');
  });

  it("still says where to go to a reader whose browser will not be sent", () => {
    expect(html).toContain('<a href="/open-source/">');
  });
});
