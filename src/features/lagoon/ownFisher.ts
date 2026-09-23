import type { Fisher } from "./Fisher";

/**
 * The visitor's bot: the body of a JavaScript function of `fish`, `weeks`,
 * `bots`, `me` and `rounds`, returning its orders for the round, compiled in
 * their own browser. It is the same contract the students had, less the
 * Java: everything at once, before the round, knowing only what came before.
 */
export function ownFisher(source: string, name = "You"): Fisher {
  const orders = new Function("fish", "weeks", "bots", "me", "rounds", source) as Fisher["orders"];
  return { name, orders };
}
