/** Left by the head script: what was typed before the terminal could listen. */
interface Window {
  __typed?: string[];
  __stopTyped?: () => void;
}

/** GoatCounter, when its script has arrived. */
interface Window {
  goatcounter?: { count?: (vars: { path: string; title?: string }) => void };
}
