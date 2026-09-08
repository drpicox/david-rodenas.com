import type { Feature } from "../../platform/plugin/Feature";
import { mountDeveloperMeetings } from "./browser/mountDeveloperMeetings";

/** What a week of meetings does to focus, fatigue, and how much gets finished. */
export const developerMeetingsFeature: Feature = {
  name: "developer-meetings",
  apps: { "developer-meetings": mountDeveloperMeetings },
};
