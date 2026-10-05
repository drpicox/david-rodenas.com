/** A blueprint's text as it travels in a link: its bytes in base64, with the letters a URL would have to escape swapped for ones it does not. */
export function linkCodeOf(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
