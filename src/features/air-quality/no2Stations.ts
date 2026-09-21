import type { No2Station } from "./No2Station";

/**
 * The measuring points the page offers, by the network's own code — names
 * change, and one town's code can outlive two addresses. The first is the one
 * a reader sees before choosing. Kind and area are the network's words.
 */
export const no2Stations: readonly Omit<No2Station, "years">[] = [
  { code: "08019043", name: "Barcelona (Eixample)", kind: "traffic", area: "urban" },
  { code: "08019044", name: "Barcelona (Gràcia - Sant Gervasi)", kind: "traffic", area: "urban" },
  { code: "08019004", name: "Barcelona (Poblenou)", kind: "background", area: "urban" },
  { code: "08019058", name: "Barcelona (Observatori Fabra)", kind: "background", area: "suburban" },
  { code: "08015021", name: "Badalona", kind: "background", area: "urban" },
  { code: "08187012", name: "Sabadell", kind: "traffic", area: "urban" },
  { code: "17079003", name: "Girona (Escola de Música)", kind: "traffic", area: "urban" },
  { code: "25120001", name: "Lleida", kind: "traffic", area: "urban" },
  { code: "43148028", name: "Tarragona (Parc de la Ciutat)", kind: "background", area: "urban" },
  { code: "08137001", name: "Montseny (La Castanya)", kind: "background", area: "rural" },
];
