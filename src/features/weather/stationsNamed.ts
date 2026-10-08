import { weatherGroups, type WeatherGroup } from "./weatherGroups";

/** The stations a question names — one, by its code, or every one of a group — and the group they are kept in; nothing for a name that is none of them. */
export function stationsNamed(name: string): { readonly group: WeatherGroup; readonly codes: readonly string[] } | undefined {
  const every = weatherGroups.find((group) => group.every.name === name);
  if (every) return { group: every, codes: every.stations.map(({ code }) => code) };
  const group = weatherGroups.find((each) => each.stations.some(({ code }) => code === name));
  return group && { group, codes: [name] };
}
