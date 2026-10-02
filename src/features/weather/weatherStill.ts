import { readRunning } from "../../platform/data/readRunning";
import { renderSourceLine, type SourceIndex } from "../../platform/data/renderSourceLine";
import { withSoFar } from "../../platform/data/withSoFar";
import type { Still } from "../../platform/plugin/Feature";
import { firstQuestion } from "./firstQuestion";
import { renderWeatherFigure } from "./renderWeatherFigure";
import type { WeatherStation } from "./WeatherStation";
import { weatherStations } from "./weatherStations";

/** The figure a reader sees before choosing anything: the first station, and the question the page is named after, the year still running with it when there is one. */
export const weatherStill: Still = (read) => {
  const file = `${weatherStations[0]?.code}.json`;
  const running = readRunning<WeatherStation>(read, "/data/weather/running.json");
  const station = withSoFar(JSON.parse(read(`/data/weather/${file}`)) as WeatherStation, running, file);
  const index = JSON.parse(read("/data/weather/index.json")) as SourceIndex;
  return renderWeatherFigure(station, firstQuestion) + renderSourceLine(index, running);
};
