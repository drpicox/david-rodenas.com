import { coreNodes } from "../blueprint/coreNodes";
import { coreTypes } from "../blueprint/coreTypes";
import { type Kit, kitOf } from "../blueprint/kitOf";
import type { Feature } from "./Feature";
import { programNode } from "./programNode";

/**
 * Everything a blueprint on this site can name: the nodes and wires every
 * blueprint has, the ones each feature brings of its own data, and every
 * program a feature brings, as a node of its own.
 */
export function blueprintKitOf(features: readonly Feature[]): Kit {
  const programs = features.flatMap((feature) => feature.programs ?? []).map(programNode);
  return kitOf([...coreNodes, ...features.flatMap((feature) => feature.nodes ?? []), ...programs], [...coreTypes, ...features.flatMap((feature) => feature.pinTypes ?? [])]);
}
