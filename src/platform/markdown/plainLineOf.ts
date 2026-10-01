/** A line of markdown with the markup it is written in taken out, so that it reads as the sentence it is. */
export const plainLineOf = (line: string) => line.replace(/\]\([^)]*\)/g, "]").replace(/[#*_`>\[\]]/g, "").trim();
