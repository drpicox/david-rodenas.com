import { type Directory, getDirectory } from "@/utils/content/directories";
import { navigatePath, normalizePath, toContentPath } from "@/utils/pathUtils";

export class CurrentPath {
  #path = "~";

  getPath(): string {
    return this.#path;
  }

  getPathOf(partialPath: string): string {
    return navigatePath(this.#path, partialPath);
  }

  getParentPathOf(path: string): string {
    return this.getPathOf(`${path}/..`);
  }

  getAbsolutePath(): string {
    return toContentPath(this.#path);
  }

  getAbsolutePathOf(partialPath: string): string {
    return toContentPath(this.getPathOf(partialPath));
  }

  getDirectory(): Directory | undefined {
    return getDirectory(this.getAbsolutePath());
  }

  changePath(name: string) {
    this.#path = navigatePath(this.#path, name);
  }

  setPath(newPath: string) {
    this.#path = normalizePath(newPath);
  }
}
