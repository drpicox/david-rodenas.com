import ts from "typescript";

/**
 * Whether a file holds nothing that runs: only interfaces, types and the
 * imports they need. Such a file cannot be tested — there is nothing in it
 * for a test to call — so the picture does not count it against the tests.
 */
export function onlyTypes(text: string): boolean {
  const file = ts.createSourceFile("source.ts", text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const isType = (statement: ts.Statement) => ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement) || (ts.isExportDeclaration(statement) && statement.isTypeOnly);
  return file.statements.some(isType) && file.statements.every((statement) => isType(statement) || ts.isImportDeclaration(statement));
}
