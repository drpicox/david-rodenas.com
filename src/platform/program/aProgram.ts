import type { Program } from "./Program";

/** A program small enough to check by hand: money left in a bank for some years. */
export const aProgram: Program = {
  name: "savings",
  summary: "what a sum grows to, left alone",
  parameters: [
    { name: "sum", label: "Sum", description: "what goes in, in euros", min: 1, max: 1_000_000, step: 0.1, initial: 100, scale: "log", show: (v) => `${Math.round(v)} €` },
    { name: "rate", label: "Rate", description: "yearly interest, in percent", min: 0, max: 20, step: 0.5, initial: 10 },
    { name: "years", label: "Years", description: "how long it is left", min: 0, max: 50, step: 1, initial: 2 },
  ],
  run: ({ sum = 0, rate = 0, years = 0 }) => {
    const grown = Math.round(sum * (1 + rate / 100) ** years);
    return { text: `${grown} €`, html: `<p><strong>${grown}</strong> €</p>`, data: { grown } };
  },
};
