import ts from "typescript";

export interface Import {
  readonly specifier: string;
  readonly typeOnly: boolean;
}

/** Nothing but types named: `import type { A }`, or `import { type A, type B }`. */
function onlyTypes(clauseIsTypeOnly: boolean, elements: readonly { isTypeOnly: boolean }[] | undefined, hasDefault: boolean): boolean {
  if (clauseIsTypeOnly) return true;
  return !hasDefault && elements !== undefined && elements.length > 0 && elements.every((element) => element.isTypeOnly);
}

/**
 * Every import and re-export in a file, read by the compiler rather than by a
 * pattern, so that an import written inside a string or a comment is not one,
 * and so that it can be told whether only a type was wanted.
 */
export function importsOf(text: string): Import[] {
  const file = ts.createSourceFile("source.ts", text, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  const found: Import[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const named = clause?.namedBindings && ts.isNamedImports(clause.namedBindings) ? clause.namedBindings.elements : undefined;
      found.push({ specifier: node.moduleSpecifier.text, typeOnly: clause ? onlyTypes(clause.isTypeOnly, named, clause.name !== undefined) : false });
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const named = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : undefined;
      found.push({ specifier: node.moduleSpecifier.text, typeOnly: onlyTypes(node.isTypeOnly, named, false) });
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [argument] = node.arguments;
      if (argument && ts.isStringLiteral(argument)) found.push({ specifier: argument.text, typeOnly: false });
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}
