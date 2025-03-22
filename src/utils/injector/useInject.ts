import { Injector } from "@/utils/injector/Injector";

export function useInject() {
  return Injector.inject;
}
