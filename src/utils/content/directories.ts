import { type ContentFile, contentIndex } from "@/data/contentIndex";

export class Directory {
  readonly path: string;
  readonly files: ContentFile[] = [];
  readonly directories: Directory[] = [];

  get name(): string {
    return this.path.split("/").pop() || "";
  }

  getCompletions(prefix: string) {
    const names = [
      ...this.files.map((file) => file.name),
      ...this.directories.map((dir) => dir.name),
    ];

    const completions = names.filter((name) => name.startsWith(prefix));
    return completions;
  }

  complete(prefix: string) {
    const completions = this.getCompletions(prefix);

    if (completions.length === 0) return "";
    if (completions.length === 1) {
      return completions[0];
    }
    if (completions.length > 1) {
      const commonPrefix = completions.reduce((acc, fileName) => {
        let i = 0;
        while (
          i < acc.length &&
          i < fileName.length &&
          acc[i] === fileName[i]
        ) {
          i++;
        }
        return acc.slice(0, i);
      }, completions[0]);

      return commonPrefix;
    }
  }

  constructor(path: string) {
    this.path = path;
  }

  addFile(file: ContentFile) {
    this.files.push(file);
  }

  addDirectory(directory: Directory) {
    if (this.directories.some((existing) => existing.path === directory.path))
      return;
    this.directories.push(directory);
  }

  getSubdirectory(dirName: string) {
    return this.directories.find((directory) => directory.name === dirName);
  }

  getFile(fileName: string) {
    return this.files.find((file) => file.name === fileName);
  }

  hasParent() {
    return this.path !== "/content";
  }

  getParentPath() {
    return this.path.replace(/\/[^/]+$/, "");
  }
}

class DirectoriesBuilder {
  readonly #directoryMap: Record<string, Directory> = {};
  readonly #contentIndex: ContentFile[];

  constructor(contentIndex: ContentFile[]) {
    this.#contentIndex = contentIndex;
  }

  build(): Directory[] {
    for (const file of this.#contentIndex) {
      this.#addFile(file);
    }

    return Object.values(this.#directoryMap);
  }

  #addFile(file: ContentFile) {
    const directory = this.#getDirectory(file.path);
    const parentDirectory = this.#getParentDirectory(file.path);

    directory.addFile(file);
    if (parentDirectory) {
      parentDirectory.addDirectory(directory);
    }
  }

  #getDirectory(filePath: string): Directory {
    const path = filePath.replace(/\/[^/]+$/, "");
    if (this.#directoryMap[path]) return this.#directoryMap[path];

    const directory = new Directory(path);
    this.#directoryMap[path] = directory;

    return directory;
  }

  #getParentDirectory(filePath: string): Directory | null {
    const path = filePath.replace(/\/[^/]+$/, "");
    if (path === "/content") return null;

    return this.#getDirectory(path);
  }
}

export const directories = new DirectoriesBuilder(contentIndex.files).build();

export function getDirectory(path: string): Directory | undefined {
  return directories.find((directory) => directory.path === path);
}
