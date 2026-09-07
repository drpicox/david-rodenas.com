/**
 * Where a path points from where the shell is. Both are routes: absolute,
 * with a trailing slash, `/` for the root. `~` is another name for the root,
 * and nothing walks above it.
 */
export function resolvePath(cwd: string, target: string): string {
  const fromRoot = target.startsWith("~") || target.startsWith("/");
  const start = fromRoot ? [] : cwd.split("/").filter(Boolean);
  const steps = target.replace(/^~/, "").split("/").filter(Boolean);

  const parts = [...start];
  for (const step of steps) {
    if (step === ".") continue;
    if (step === "..") parts.pop();
    else parts.push(step);
  }
  return parts.length === 0 ? "/" : `/${parts.join("/")}/`;
}
