import type { Still } from "../../platform/plugin/Feature";
import { DISPATCHERS } from "./DISPATCHERS";
import { renderDispatcherRun } from "./renderDispatcherRun";

/** Every way of writing the dispatcher, each with how the tests took it, in the HTML before any script. */
export const testsAsExamplesStill: Still = () => DISPATCHERS.map((dispatcher) => `<section><h4>${dispatcher.label}</h4>${renderDispatcherRun(dispatcher)}</section>`).join("");
