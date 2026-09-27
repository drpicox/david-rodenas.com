const C = 299792458;

/** 0.95 is "95%"; 0.99999 is "99.999%": as many nines as it has, because past 99% the nines are the whole story. */
export function saidSpeed(share: number): string {
  if (share < 0.01) return `${Math.round((share * C) / 1000).toLocaleString("en-US")} km/s`;
  if (share < 0.99) return `${(share * 100).toPrecision(2)}% of c`;
  const nines = Math.min(12, Math.ceil(-Math.log10(1 - share)));
  return `${(Math.floor(share * 10 ** nines) / 10 ** (nines - 2)).toFixed(nines - 2)}% of c`;
}
