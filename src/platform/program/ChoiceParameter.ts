/**
 * One name out of a list. A name may have spaces, which a command line does
 * not: typed, it is written in lower case with hyphens, `--to tau-ceti`.
 */
export interface ChoiceParameter {
  readonly name: string;
  readonly label: string;
  readonly description: string;
  readonly choices: readonly string[];
  readonly initial: string;
}
