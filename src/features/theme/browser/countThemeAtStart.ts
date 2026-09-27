import { eventName } from "../../../platform/analytics/eventName";
import { countEvent } from "../../../platform/browser/countEvent";

/** The colours a reader arrives with, counted once a visit: what they chose before, or the system's if they never did. */
export function countThemeAtStart(): void {
  let kept: string | null = null;
  try {
    kept = localStorage.getItem("theme");
  } catch {
    // Without storage there is no choice kept, which is the system's.
  }
  countEvent(eventName("theme", "start", kept ?? "system"));
}
