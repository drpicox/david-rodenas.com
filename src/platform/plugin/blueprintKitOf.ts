import { coreNodes } from "../blueprint/coreNodes";
import { coreTypes } from "../blueprint/coreTypes";
import { type Kit, kitOf } from "../blueprint/kitOf";
import type { Feature } from "./Feature";

/** Everything a blueprint on this site can name: the nodes and wires every blueprint has, and the ones each feature brings of its own data. */
export function blueprintKitOf(features: readonly Feature[]): Kit {
  return kitOf([...coreNodes, ...features.flatMap((feature) => feature.nodes ?? [])], [...coreTypes, ...features.flatMap((feature) => feature.pinTypes ?? [])]);
}
