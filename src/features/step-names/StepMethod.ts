/** A sentence read as a call: the method's name, and each quoted string or number in it as an argument. */
export interface StepMethod {
  readonly name: string;
  readonly arguments: readonly { readonly value: string; readonly name: string; readonly type: "String" | "int" }[];
  readonly text: string;
}
