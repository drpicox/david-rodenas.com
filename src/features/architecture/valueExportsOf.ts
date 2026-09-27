import ts from "typescript";

const exported = (node: ts.Node) => ts.canHaveModifiers(node) && (ts.getModifiers(node) ?? []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);

/**
 * The names of the values a file exports — its functions, classes, constants
 * — and not its types, which the code base lets travel with the value they
 * describe. The rule is one of these a file.
 */
export function valueExportsOf(text: string): string[] {
  const file = ts.createSourceFile("source.ts", text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const names: string[] = [];
  for (const statement of file.statements) {
    if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement) || ts.isEnumDeclaration(statement)) && exported(statement)) {
      names.push(statement.name?.text ?? "default");
    } else if (ts.isVariableStatement(statement) && exported(statement)) {
      for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name)) names.push(declaration.name.text);
    } else if (ts.isExportAssignment(statement)) {
      names.push("default");
    } else if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) if (!element.isTypeOnly) names.push(element.name.text);
    }
  }
  return names;
}
