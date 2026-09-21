import { wordsOf } from "./wordsOf";

export interface Candidate {
  readonly word: string;
  readonly count: number;
  readonly probability: number;
}

export interface Transition extends Candidate {
  readonly context: readonly string[];
}

const SEPARATOR = " ";

/**
 * The whole of the idea behind a language model, with everything else taken
 * away: read a text, count which word followed which, and offer what followed
 * most. `memory` is how many words back it looks — one is bigrams, two
 * trigrams. It keeps the counts for every shorter memory as well, because a
 * long context it has never seen is no reason to fall silent.
 */
export class NextWordModel {
  readonly vocabulary: readonly string[];
  readonly commonest: string | null;
  private readonly followers = new Map<string, Map<string, number>>();

  constructor(
    text: string,
    readonly memory: number,
  ) {
    const words = wordsOf(text);
    const seen = new Map<string, number>();
    for (const word of words) seen.set(word, (seen.get(word) ?? 0) + 1);
    this.vocabulary = [...seen.keys()];
    this.commonest = [...seen].reduce<[string, number] | null>((best, entry) => (best && best[1] >= entry[1] ? best : entry), null)?.[0] ?? null;

    for (let at = 1; at < words.length; at += 1) {
      for (let back = 1; back <= memory && back <= at; back += 1) {
        const key = words.slice(at - back, at).join(SEPARATOR);
        const counts = this.followers.get(key) ?? new Map<string, number>();
        counts.set(words[at] ?? "", (counts.get(words[at] ?? "") ?? 0) + 1);
        this.followers.set(key, counts);
      }
    }
  }

  /** What may come next, and the part of the context that was actually recognised. */
  after(context: readonly string[]): { context: readonly string[]; candidates: Candidate[] } {
    for (let back = Math.min(this.memory, context.length); back >= 1; back -= 1) {
      const used = context.slice(-back);
      const counts = this.followers.get(used.join(SEPARATOR));
      if (counts) return { context: used, candidates: ranked(counts) };
    }
    return { context: [], candidates: [] };
  }

  /** Everything learnt at full memory, the surest first. */
  transitions(): Transition[] {
    return [...this.followers]
      .filter(([key]) => key.split(SEPARATOR).length === this.memory)
      .flatMap(([key, counts]) => ranked(counts).map((candidate) => ({ context: key.split(SEPARATOR), ...candidate })))
      .sort((a, b) => b.probability - a.probability || b.count - a.count);
  }
}

function ranked(counts: ReadonlyMap<string, number>): Candidate[] {
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts].map(([word, count]) => ({ word, count, probability: count / total })).sort((a, b) => b.count - a.count);
}
