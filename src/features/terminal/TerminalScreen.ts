import { AbstractSubject } from "@/utils/injector/AbstractSubject";
import type { ReactNode } from "react";

export class TerminalScreen extends AbstractSubject {
  #content: ReactNode[] = [];

  append(output: ReactNode): void {
    this.#content.push(output);
    this.notify();
  }

  getContent(): ReactNode[] {
    return this.#content;
  }

  clear() {
    this.#content = [];
  }
}
