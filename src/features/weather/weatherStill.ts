import { renderSourceLine, type SourceIndex } from "../../platform/data/renderSourceLine";
import type { Still } from "../../platform/plugin/Feature";
import { firstQuestion } from "./firstQuestion";
import { renderWeatherFigure } from "./renderWeatherFigure";
import type { WeatherStation } from "./WeatherStation";
import { weatherStations } from "./weatherStations";

/** The figure a reader sees before choosing anything: the first station, and the question the page is named after. */
export const weatherStill: Still = (read) => {
  const station = JSON.parse(read(`/data/weather/${weatherStations[0]?.code}.json`)) as WeatherStation;
  const index = JSON.parse(read("/data/weather/index.json")) as SourceIndex;
  return renderWeatherFigure(station, firstQuestion) + renderSourceLine(index);
};
