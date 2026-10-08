import type { RefreshPorts } from "./RefreshPorts";
import type { YearlySource } from "./YearlySource";

/**
 * What a source's portal answers for a year, an answer an address. An
 * address is asked once however many years it holds, given the same `known`:
 * a series published whole is one file, and a source filled from its first
 * year would fetch it again for every one. A page that links to the file is
 * read in words and followed, because some portals name the file anew each
 * year and only the page stays where it was.
 */
export async function answersOf<Held>(source: YearlySource<Held>, year: number, ports: RefreshPorts, known = new Map<string, Promise<unknown>>()): Promise<unknown[]> {
  const ask = (url: string, inWords: boolean): Promise<unknown> => {
    const key = `${inWords ? "text" : "json"} ${url}`;
    const answer = known.get(key) ?? (inWords ? ports.fetchText(url) : ports.fetchJson(url));
    known.set(key, answer);
    return answer;
  };
  const answers: unknown[] = [];
  for (const url of source.requestsFor(year, ports.today)) {
    const file = source.follow ? source.follow(String(await ask(url, true))) : url;
    answers.push(await ask(file, source.answers === "text"));
  }
  return answers;
}
