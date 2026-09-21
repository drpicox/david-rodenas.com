export interface NearStar {
  readonly name: string;
  /** Right ascension in hours and declination in degrees, to the minute or so: enough for a picture. */
  readonly ra: number;
  readonly dec: number;
  readonly lightYears: number;
}

/** The stars within twelve light-years of the Sun, a system to a line. Approximate, from the standard catalogues. */
export const nearStars: readonly NearStar[] = [
  { name: "Proxima Centauri", ra: 14.495, dec: -62.68, lightYears: 4.24 },
  { name: "Alpha Centauri", ra: 14.66, dec: -60.83, lightYears: 4.37 },
  { name: "Barnard's Star", ra: 17.963, dec: 4.69, lightYears: 5.96 },
  { name: "Wolf 359", ra: 10.941, dec: 7.01, lightYears: 7.86 },
  { name: "Lalande 21185", ra: 11.056, dec: 35.97, lightYears: 8.31 },
  { name: "Sirius", ra: 6.752, dec: -16.72, lightYears: 8.58 },
  { name: "Luyten 726-8", ra: 1.65, dec: -17.95, lightYears: 8.73 },
  { name: "Ross 154", ra: 18.83, dec: -23.84, lightYears: 9.69 },
  { name: "Ross 248", ra: 23.699, dec: 44.18, lightYears: 10.3 },
  { name: "Epsilon Eridani", ra: 3.549, dec: -9.46, lightYears: 10.52 },
  { name: "Lacaille 9352", ra: 23.098, dec: -35.85, lightYears: 10.72 },
  { name: "Ross 128", ra: 11.796, dec: 0.8, lightYears: 11.01 },
  { name: "EZ Aquarii", ra: 22.643, dec: -15.3, lightYears: 11.1 },
  { name: "61 Cygni", ra: 21.115, dec: 38.75, lightYears: 11.4 },
  { name: "Procyon", ra: 7.655, dec: 5.22, lightYears: 11.46 },
  { name: "Struve 2398", ra: 18.713, dec: 59.63, lightYears: 11.5 },
  { name: "Groombridge 34", ra: 0.306, dec: 44.02, lightYears: 11.6 },
  { name: "Epsilon Indi", ra: 22.056, dec: -56.78, lightYears: 11.87 },
  { name: "Tau Ceti", ra: 1.734, dec: -15.94, lightYears: 11.91 },
];
