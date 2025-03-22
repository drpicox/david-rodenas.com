// biome-ignore lint/suspicious/noExplicitAny: necessary
export type Constructor<T = unknown> = new (...args: any[]) => T;

interface Injectable {
  $inject?: Constructor[];
}

export class Injector {
  private static instance: Injector;
  private services: Map<Constructor, unknown> = new Map();

  private constructor() {
    this.register(Injector as unknown as Constructor<this>, this);
  }

  public static getInstance(): Injector {
    if (!Injector.instance) {
      Injector.instance = new Injector();
    }
    return Injector.instance;
  }

  public register<T>(serviceName: Constructor<T>, service: T): void {
    this.services.set(serviceName, service);
  }

  public resolve<T>(Service: Constructor<T>): T {
    let service = this.services.get(Service) as T;
    if (!service) {
      const injections = (Service as Injectable).$inject || [];
      const args = injections.map((injection) => this.resolve(injection));
      service = new Service(...args);
      this.services.set(Service, service);
    }
    return service;
  }

  public clear(): void {
    this.services.clear();
  }

  // Overload for no dependencies
  public static inject<R>(services: [], callback: R): R;

  // Overload for 1 dependency
  public static inject<S1, R>(
    services: [Constructor<S1>],
    callback: (arg1: S1) => R,
  ): R;

  // Overload for 2 dependencies
  public static inject<S1, S2, R>(
    services: [Constructor<S1>, Constructor<S2>],
    callback: (arg1: S1, arg2: S2) => R,
  ): R;

  // Overload for 3 dependencies
  public static inject<S1, S2, S3, R>(
    services: [Constructor<S1>, Constructor<S2>, Constructor<S3>],
    callback: (arg1: S1, arg2: S2, arg3: S3) => R,
  ): R;

  // Overload for 4 dependencies
  public static inject<S1, S2, S3, S4, R>(
    services: [
      Constructor<S1>,
      Constructor<S2>,
      Constructor<S3>,
      Constructor<S4>,
    ],
    callback: (arg1: S1, arg2: S2, arg3: S3, arg4: S4) => R,
  ): R;

  // Overload for 5 dependencies
  public static inject<S1, S2, S3, S4, S5, R>(
    services: [
      Constructor<S1>,
      Constructor<S2>,
      Constructor<S3>,
      Constructor<S4>,
      Constructor<S5>,
    ],
    callback: (arg1: S1, arg2: S2, arg3: S3, arg4: S4, arg5: S5) => R,
  ): R;

  // Implementation
  public static inject<R>(
    services: Constructor[],
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    callback: (...args: any[]) => R,
  ): R {
    const injector = Injector.getInstance();
    const resolvedServices = services.map((service) =>
      injector.resolve(service),
    );
    return callback(...resolvedServices);
  }
}
