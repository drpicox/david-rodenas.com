/** A choice as a command line writes it: `Tau Ceti` is `tau-ceti`. */
export function wordOf(choice: string): string {
  return choice.toLowerCase().replace(/\s+/g, "-");
}
