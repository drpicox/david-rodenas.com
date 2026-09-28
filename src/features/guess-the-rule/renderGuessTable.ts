import type { Row } from "./GuessRound";

/** The sequences tested, one a row, ✅ or ❌ as the rule took it, the one just tried marked. */
export function renderGuessTable(rows: readonly Row[]): string {
  const body = rows.map(({ a, b, c, holds, last }) => `<tr${last ? ' class="last"' : ""}><td>${a},</td><td>${b},</td><td>${c}</td><td>${holds ? "✅" : "❌"}</td></tr>`).join("");
  return `<table class="guess-table"><thead><tr><th>a,</th><th>b,</th><th>c</th><th></th></tr></thead><tbody>${body}</tbody></table>`;
}
