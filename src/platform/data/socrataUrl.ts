const PORTAL = "https://analisi.transparenciacatalunya.cat/resource";

export interface SocrataQuery {
  readonly select?: string;
  readonly where?: string;
  readonly group?: string;
  readonly order?: string;
  readonly limit?: number;
}

/** A SoQL question to the Generalitat's open data portal, as the address that asks it. */
export function socrataUrl(dataset: string, query: SocrataQuery): string {
  const url = new URL(`${PORTAL}/${dataset}.json`);
  for (const [clause, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(`$${clause}`, String(value));
  }
  return url.toString();
}
