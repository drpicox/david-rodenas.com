/** The directory a route is listed in, or null for the root. */
export function parentOf(route: string): string | null {
  if (route === "/") return null;
  const trimmed = route.slice(0, -1);
  return trimmed.slice(0, trimmed.lastIndexOf("/") + 1);
}
