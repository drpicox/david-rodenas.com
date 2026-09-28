/** A count and its noun, one or many: `1 file`, `2 boxes`. */
export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}
