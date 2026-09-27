/** `?portfolio=on` or `?portfolio=off`: a link that turns the cards on for whoever follows it. */
export function askedInAddress(search: string): "on" | "off" | undefined {
  const asked = new URLSearchParams(search).get("portfolio");
  return asked === "on" || asked === "off" ? asked : undefined;
}
