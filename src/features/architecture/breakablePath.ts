import { escapeHtml } from "../../platform/markdown/escapeHtml";

/** A file's path, escaped, that may wrap after any of its slashes and nowhere else: in a narrow column it breaks where a reader would. */
export function breakablePath(path: string): string {
  return escapeHtml(path).replaceAll("/", "/<wbr>");
}
