/** The file of monthly mean temperatures, by the name the Meteocat gives it every year: Barcelona_TM_m_1780_ and the last year in it. */
const LINK = /href="(https:\/\/[^"]+\/Barcelona_TM_m_[^"/]+\.txt)"/;

/** Where the Meteocat keeps Barcelona's series this year, read off the page that links to it: its address changes with every year added, and the page's does not. */
export function barcelonaLinkOf(page: string): string {
  const link = LINK.exec(page)?.[1];
  if (!link) throw new Error("the Meteocat's page no longer links to the series of temperatures");
  return link;
}
