import { type Constructor, Injector } from "@/utils/injector/Injector";
import type { Subject } from "@/utils/injector/Subject";
import { useEffect, useReducer } from "react";

export function useInjection<T>(serviceConstructor: Constructor<T>): T {
  const injector = Injector.getInstance();
  const service = injector.resolve(serviceConstructor);
  const [, refresh] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    if (typeof (service as Subject).subscribe !== "function") return;
    return (service as Subject).subscribe(refresh);
  }, [service]);

  return service;
}
