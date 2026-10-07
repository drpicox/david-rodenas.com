import type { Feature } from "../../platform/plugin/Feature";
import { seaNodes } from "./nodes/seaNodes";
import { seaSource } from "./seaSource";

/** The temperature of the sea off the Catalan coast, a day at a time since 1982: the open data it keeps, and its points as nodes of a blueprint. */
export const seaFeature: Feature = {
  name: "sea",
  sources: [seaSource],
  nodes: seaNodes,
};
