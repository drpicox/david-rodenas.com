import type { Subject } from "@/utils/injector/Subject";

export class AbstractSubject implements Subject {
  private observers: (() => void)[] = [];

  subscribe(callback: () => void): () => void {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(
        (observer) => observer !== callback,
      );
    };
  }

  protected notify(): void {
    for (const observer of this.observers) {
      observer();
    }
  }
}
