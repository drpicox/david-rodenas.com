import type { WeatherStation } from "./WeatherStation";

/**
 * The stations the page offers, by the network's code: a code is one place,
 * and a series is never joined to another even when the town is the same.
 * All of them are still reporting, so they can all say something about now.
 * The first is the one a reader sees before choosing.
 */
export const weatherStations: readonly Omit<WeatherStation, "years">[] = [
  { code: "WU", name: "Badalona - Museu", municipality: "Badalona", altitude: 42, setting: "urban, by the sea" },
  { code: "X4", name: "Barcelona - el Raval", municipality: "Barcelona", altitude: 33, setting: "dense city, on a roof" },
  { code: "X8", name: "Barcelona - Zona Universitària", municipality: "Barcelona", altitude: 82, setting: "city edge" },
  { code: "D5", name: "Barcelona - Observatori Fabra", municipality: "Barcelona", altitude: 410, setting: "wooded hill above the city" },
  { code: "UP", name: "Cabrils", municipality: "Cabrils", altitude: 81, setting: "coastal slope, half rural" },
  { code: "XF", name: "Sabadell - Parc Agrari", municipality: "Sabadell", altitude: 259, setting: "farmland beside a city" },
  { code: "XJ", name: "Girona", municipality: "Girona", altitude: 72, setting: "market gardens by the city" },
  { code: "XE", name: "Tarragona - Complex Educatiu", municipality: "Tarragona", altitude: 6, setting: "coast" },
  { code: "VK", name: "Raimat", municipality: "Lleida", altitude: 286, setting: "inland plain, vineyards" },
];
