const AU = 1.495978707e11;
const LIGHT_YEAR = 9.4607e15;

export interface Destination {
  readonly name: string;
  readonly metres: number;
  /** The distance the way people say it. */
  readonly said: string;
  /** For what is far beyond the map of near stars: which way it lies, right ascension in hours and declination in degrees. */
  readonly towards?: { readonly ra: number; readonly dec: number };
}

/**
 * Places to go, in a straight line from the Earth. For the planets it is the
 * gap between their orbit and ours, which is what the trip is when they are
 * nearest; nothing here waits for a launch window.
 */
export const destinations: readonly Destination[] = [
  { name: "the Moon", metres: 384.4e6, said: "384,400 km" },
  { name: "Mars", metres: 0.52 * AU, said: "0.52 au" },
  { name: "Jupiter", metres: 4.2 * AU, said: "4.2 au" },
  { name: "Saturn", metres: 8.5 * AU, said: "8.5 au" },
  { name: "Pluto", metres: 38.5 * AU, said: "38.5 au" },
  { name: "Proxima Centauri", metres: 4.24 * LIGHT_YEAR, said: "4.24 light-years" },
  { name: "Sirius", metres: 8.58 * LIGHT_YEAR, said: "8.58 light-years" },
  { name: "Epsilon Eridani", metres: 10.52 * LIGHT_YEAR, said: "10.52 light-years" },
  { name: "Tau Ceti", metres: 11.91 * LIGHT_YEAR, said: "11.91 light-years" },
  { name: "the centre of the galaxy", metres: 26000 * LIGHT_YEAR, said: "26,000 light-years", towards: { ra: 17.76, dec: -29 } },
  { name: "Andromeda", metres: 2.5e6 * LIGHT_YEAR, said: "2.5 million light-years", towards: { ra: 0.712, dec: 41.27 } },
];
