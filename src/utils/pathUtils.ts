export function normalizePath(path: string) {
  const segments = path.split("/");

  if (segments[0] === "" && segments[1] === "content") {
    segments.splice(0, 2, "~");
  }

  const stack: string[] = [];
  for (const segment of segments) {
    if (segment === "~") {
      stack.length = 0;
      stack.push("~");
    } else if (segment === "..") {
      stack.pop();
    } else if (segment !== ".") {
      stack.push(segment);
    }
  }

  return stack.join("/");
}

export function navigatePath(source: string, target: string) {
  const normalizedTarget = normalizePath(target);
  if (normalizedTarget.startsWith("~/")) {
    return normalizedTarget;
  }

  return normalizePath(`${source}/${target}`);
}

export function arePathsEqual(path1: string, path2: string) {
  return normalizePath(path1) === normalizePath(path2);
}

export function toContentPath(path: string) {
  return path.replace(/^~/, "/content");
}

export function toRelativePath(from: string, to: string) {
  const fromSegments = normalizePath(from).split("/");
  const toSegments = normalizePath(to).split("/");

  while (fromSegments.length > 0 && fromSegments[0] === toSegments[0]) {
    fromSegments.shift();
    toSegments.shift();
  }

  while (fromSegments.length > 0) {
    fromSegments.shift();
    toSegments.unshift("..");
  }

  if (toSegments.length === 0) {
    return ".";
  }

  return toSegments.join("/");
}
