/** The last segment, which is the name a listing shows. */
export function nameOf(route: string): string {
  if (route === "/") return "/";
  const trimmed = route.slice(0, -1);
  return trimmed.slice(trimmed.lastIndexOf("/") + 1);
}
