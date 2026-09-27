/**
 * The name an event is counted under: its parts joined with dashes. A part
 * may be a route or an address; it loses its scheme and its outer slashes,
 * because GoatCounter will not have an event's name begin with one.
 */
export function eventName(...parts: readonly string[]): string {
  return parts
    .map((part) => part.replace(/^[a-z]+:\/\//, "").replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("-");
}
