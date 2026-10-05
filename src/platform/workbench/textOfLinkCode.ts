/** A blueprint's text back out of a link; nothing, when what the link carries is not one. */
export function textOfLinkCode(code: string): string | null {
  try {
    const binary = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
  } catch {
    return null;
  }
}
