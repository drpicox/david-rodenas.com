import { describe, expect, it } from "vitest";
import { eventName } from "./eventName";

describe("the name an event is counted under", () => {
  it("is its parts joined with dashes, as GoatCounter names an event", () => {
    expect(eventName("trial", "portfolio", "on")).toBe("trial-portfolio-on");
  });

  it("takes a route or an address in as one part, its slashes kept inside but never first", () => {
    expect(eventName("portfolio-on", "open", "/projects/rocinante/")).toBe("portfolio-on-open-projects/rocinante");
    expect(eventName("open", "https://drpicox.medium.com/some-essay-45ed")).toBe("open-drpicox.medium.com/some-essay-45ed");
  });
});
