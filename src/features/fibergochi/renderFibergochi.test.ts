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
    expect(html).toMatch(/<button[^>]*class="lamp on"[^>]*title="exam: something to study, about 1 hour"/);
    expect(html).toMatch(/<button[^>]*class="lamp off"[^>]*title="terminal: no terminal"/);
    expect(html).toContain("1, 0:00h (1)");
  });

  it("says under the date what each lamp means, and how much work there is behind it", () => {
    const work = (exams: number[], labs: number[], terminal = 0) =>
      renderFibergochi(new Fibergochi(always(0.5), { exams: [...exams, 0, 0, 0, 0, 0, 0], labs: [...labs, 0, 0, 0, 0, 0, 0], terminal }), running);
    expect(work([0, 0, 0, 0], [0, 0, 0, 0])).toContain("nothing to study");
    expect(work([0, 0, 0, 0], [0, 0, 0, 0])).toContain("no lab to do");
    expect(work([2, 0, 0, 0], [0, 0, 0, 0])).toContain("a little to study, under an hour");
    expect(work([3, 6, 0, 0], [0, 0, 0, 0])).toContain("something to study, about 3 hours");
    expect(work([9, 9, 6, 0], [0, 0, 0, 0])).toContain("a lot to study, about 8 hours");
    expect(work([0, 0, 0, 0], [6, 0, 0, 0])).toContain("some lab work, about 2 hours");
    expect(work([0, 0, 0, 0], [6, 0, 0, 0])).toContain("no terminal, and labs need one");
    expect(work([0, 0, 0, 0], [0, 0, 0, 0], 4)).toMatch(/<\/b> a terminal<\/li>/);
  });

  it("marks the line of the lamp that was pressed, for whoever has no mouse to hover with", () => {
    const html = renderFibergochi(new Fibergochi(always(0.5)), { ...running, picked: "lab" });
    expect(html).toMatch(/<li class="off picked" data-lamp="lab">/);
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
