/** A short name for some text, the same every time for the same text: FNV-1a, in base 36. Enough to tell a page's blueprints apart, and to notice one rewritten. */
export function hashOf(text: string): string {
  let hash = 0x811c9dc5;
  for (let at = 0; at < text.length; at += 1) {
    hash ^= text.charCodeAt(at);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}
