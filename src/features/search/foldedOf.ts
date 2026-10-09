/**
 * A text as a search reads it: in small letters and without accents, so that
 * a reader who types salva finds Salvà. A letter is kept for every letter,
 * so that what is found at a place in it is at the same place in the text.
 */
export function foldedOf(text: string): string {
  let folded = "";
  for (const character of text) {
    if (character.length > 1) {
      folded += character;
      continue;
    }
    const lower = (character.normalize("NFD")[0] ?? character).toLowerCase();
    folded += lower.length === 1 ? lower : character;
  }
  return folded;
}
