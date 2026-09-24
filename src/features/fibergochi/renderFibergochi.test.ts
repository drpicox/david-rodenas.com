import { describe, expect, it } from "vitest";
import { Fibergochi } from "./Fibergochi";
import { renderFibergochi } from "./renderFibergochi";

const always = (value: number) => () => value;
const running = { running: true, confirmingNew: false };

describe("the Fibergochi, drawn", () => {
  it("shows the drawing of 1999 in the egg, told in words for whoever cannot see it", () => {
    const html = renderFibergochi(new Fibergochi(always(0.5)), running);
    expect(html).toContain('src="/fibergochi/normal0.gif"');
    expect(html).toMatch(/alt="[^"]+"/);
  });

  it("has the buttons of 1999, in English, with what the status bar said of each", () => {
    const html = renderFibergochi(new Fibergochi(always(0.5)), running);
    for (const label of ["Study/Sleep", "http", "alfa", "Bar", "Friends", "Find terminal", "Beg"]) expect(html).toContain(`>${label}</button>`);
    expect(html).toContain('title="Beg, to try to get more passes."');
  });

  it("lights the exam lamp when there is studying to do, and says the date as the box under the buttons did", () => {
    const html = renderFibergochi(new Fibergochi(always(0.5), { exams: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0] }), running);
    expect(html).toMatch(/<li class="on"[^>]*>exam<\/li>/);
    expect(html).toMatch(/<li class="off"[^>]*>terminal<\/li>/);
    expect(html).toContain("1, 0:00h (1)");
  });

  it("puts what it says in a box that waits to be accepted", () => {
    const html = renderFibergochi(new Fibergochi(always(0.5), { said: ["BACARRA!!!!"] }), running);
    expect(html).toContain("BACARRA!!!!");
    expect(html).toContain(">OK</button>");
  });

  it("asks for the credits as the prompt of 1999 did, with a number already in it", () => {
    const html = renderFibergochi(new Fibergochi(always(0.5), { asks: "enrol", suggested: 5, left: 5 }), running);
    expect(html).toContain("How many credits do you want to enrol in? [1..5]");
    expect(html).toMatch(/<input[^>]*type="number"[^>]*value="5"/);
  });

  it("offers the pause while it runs, and to go on while it does not", () => {
    expect(renderFibergochi(new Fibergochi(always(0.5)), running)).toContain(">pause</button>");
    expect(renderFibergochi(new Fibergochi(always(0.5)), { running: false, confirmingNew: false })).toContain(">go on</button>");
  });

  it("asks before throwing away the one there is, as it did", () => {
    const html = renderFibergochi(new Fibergochi(always(0.5)), { running: false, confirmingNew: true });
    expect(html).toContain("Are you sure you want a new Fibergochi?");
  });

  it("shows the cross when it is over", () => {
    const html = renderFibergochi(new Fibergochi(always(0.5), { ended: "bad" }), running);
    expect(html).toContain('src="/fibergochi/x0.gif"');
  });
});
