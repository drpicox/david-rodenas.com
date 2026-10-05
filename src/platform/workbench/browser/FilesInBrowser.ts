import { Pending } from "../../blueprint/Pending";

type Held = { readonly state: "coming" } | { readonly state: "here"; readonly text: string } | { readonly state: "missing" };

/**
 * The files the site serves, as a blueprint in the browser reads them: at
 * once when they are here, and otherwise asked for once and waited on —
 * reading one on its way throws Pending, and whoever listens is told when it
 * arrives, or is found not to be there. One for the page, so two blueprints
 * reading the same station fetch it once.
 */
export class FilesInBrowser {
  private readonly held = new Map<string, Held>();
  private readonly listeners = new Set<() => void>();

  constructor(private readonly fetchText: (path: string) => Promise<string>) {}

  readonly read = (path: string): string => {
    const known = this.held.get(path);
    if (known?.state === "here") return known.text;
    if (known?.state === "missing") throw new Error(`there is no ${path}`);
    if (!known) {
      this.held.set(path, { state: "coming" });
      this.fetchText(path).then(
        (text) => this.settle(path, { state: "here", text }),
        () => this.settle(path, { state: "missing" }),
      );
    }
    throw new Pending(path);
  };

  /** Told whenever a file arrives or is found missing; returns how to stop being told. */
  listen(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private settle(path: string, held: Held): void {
    this.held.set(path, held);
    for (const listener of this.listeners) listener();
  }
}
