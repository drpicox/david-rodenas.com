import type { WeatherStation } from "./WeatherStation";

/**
 * The Meteocat's long series the page offers beside the network's stations,
 * by the Meteocat's own code: a day at a time since 1950, every day checked
 * and the whole homogenised by its climatologists, and blended, where one
 * record breaks off, from more than one station near the place — so a series
 * is not a station, and is never shown as one. Each is placed where its
 * series stands now. The first is the one the long record is drawn from.
 */
export const climateSeries: readonly Omit<WeatherStation, "years">[] = [
  { code: "baic0008", name: "Barcelona - Observatori Fabra, since 1950", municipality: "Barcelona", altitude: 412, setting: "wooded hill above the city" },
  { code: "baic0007", name: "Aeroport del Prat, since 1950", municipality: "El Prat de Llobregat", altitude: 3, setting: "airport by the sea" },
  { code: "baic0019", name: "Granollers, since 1950", municipality: "Granollers", altitude: 202, setting: "inland town of the Vallès" },
  { code: "baic0009", name: "Girona, since 1950", municipality: "Girona", altitude: 72, setting: "inland city" },
  { code: "baic0012", name: "Lleida, since 1950", municipality: "Lleida", altitude: 192, setting: "city of the inland plain" },
  { code: "baic0005", name: "Observatori de l'Ebre, since 1950", municipality: "Roquetes", altitude: 49, setting: "observatory in the lower Ebre valley" },
];
