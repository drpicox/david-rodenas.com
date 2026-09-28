import { describe, expect, it } from "vitest";
import { renderGuessTable } from "./renderGuessTable";

describe("the table of sequences tested", () => {
  it("shows each sequence with ✅ or ❌, and marks the one just tried", () => {
    const html = renderGuessTable([
      { a: 1, b: 2, c: 3, holds: true, last: true },
      { a: 3, b: 2, c: 1, holds: false, last: false },
    ]);
    expect(html).toContain('<thead><tr><th>a,</th><th>b,</th><th>c</th><th></th></tr></thead>');
    expect(html).toContain('<tr class="last"><td>1,</td><td>2,</td><td>3</td><td>✅</td></tr>');
    expect(html).toContain("<tr><td>3,</td><td>2,</td><td>1</td><td>❌</td></tr>");
  });
});
