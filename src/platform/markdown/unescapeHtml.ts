const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
};

/** What escapeHtml wrote, read back: the words a place was handed, out of the attribute that carried them. */
export function unescapeHtml(text: string): string {
  return text.replace(/&(?:amp|lt|gt|quot);/g, (entity) => ENTITIES[entity] ?? entity);
}
