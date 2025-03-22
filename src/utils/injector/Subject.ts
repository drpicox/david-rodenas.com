export interface Subject {
  subscribe: (callback: () => void) => () => void;
}
