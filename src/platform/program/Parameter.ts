import type { ChoiceParameter } from "./ChoiceParameter";
import type { NumberParameter } from "./NumberParameter";

/**
 * One thing a program can be told, said once for everyone who tells it: the
 * dial a reader slides, the `--name value` a reader types, and the field an
 * agent fills in. A quantity or a choice among names.
 */
export type Parameter = NumberParameter | ChoiceParameter;
