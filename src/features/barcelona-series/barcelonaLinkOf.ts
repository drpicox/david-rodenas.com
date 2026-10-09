/** Each file of the series, by the name the Meteocat gives it every year: Barcelona_, what it holds — TM the mean temperature, PPT the rain — _m_, the first year and the last. */
const LINKS = { TM: /href="(https:\/\/[^"]+\/Barcelona_TM_m_[^"/]+\.txt)"/, PPT: /href="(https:\/\/[^"]+\/Barcelona_PPT_m_[^"/]+\.txt)"/ };
const NAMES = { TM: "temperatures", PPT: "rain" };

/** Where the Meteocat keeps one of Barcelona's series this year, read off the page that links to it: its address changes with every year added, and the page's does not. */
export function barcelonaLinkOf(page: string, file: keyof typeof LINKS): string {
  const link = LINKS[file].exec(page)?.[1];
  if (!link) throw new Error(`the Meteocat's page no longer links to the series of ${NAMES[file]}`);
  return link;
}
