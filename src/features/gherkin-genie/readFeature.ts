/** A step as the feature file says it: its keyword, its sentence, and what may hang under it. */
export interface FeatureStep {
  readonly keyword: string;
  readonly text: string;
  readonly table?: readonly (readonly string[])[];
  readonly docString?: string;
}

export interface FeatureScenario {
  readonly name: string;
  readonly steps: readonly FeatureStep[];
}

const STEP = /^(Given|When|Then|And|But) (.*)$/;
const SCENARIO = /^(?:Scenario|Example):\s*(.*)$/;
const FENCE = /^("""|```)/;

/**
 * The part of Gherkin a page needs to show what Gherkin Genie does:
 * scenarios, a background, steps, and the table or doc string under a step.
 * Gherkin Genie itself reads feature files with Cucumber's own parser; this
 * is a subset of it, written here so the page has nothing to install.
 */
export function readFeature(text: string): FeatureScenario[] {
  const scenarios: { name: string; steps: FeatureStep[] }[] = [];
  let background: FeatureStep[] | null = null;
  let current: FeatureStep[] | null = null;
  const lines = text.split("\n");
  const last = () => current?.at(-1);
  const replaceLast = (step: FeatureStep) => {
    if (current) current[current.length - 1] = step;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = (lines[index] ?? "").trim();
    if (!line || line.startsWith("#") || line.startsWith("@")) continue;
    if (line.startsWith("Background:")) {
      background = [];
      current = background;
      continue;
    }
    const scenario = SCENARIO.exec(line);
    if (scenario) {
      const steps = [...(background ?? [])];
      scenarios.push({ name: scenario[1] ?? "", steps });
      current = steps;
      continue;
    }
    const step = STEP.exec(line);
    if (step) {
      current?.push({ keyword: step[1] ?? "", text: step[2] ?? "" });
      continue;
    }
    const previous = last();
    if (line.startsWith("|") && previous) {
      const cells = line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      replaceLast({ ...previous, table: [...(previous.table ?? []), cells] });
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence && previous) {
      // The opening quotes set the margin: what is indented past them stays indented.
      const margin = (lines[index] ?? "").indexOf(fence[1] ?? "");
      const body: string[] = [];
      for (index += 1; index < lines.length && !(lines[index] ?? "").trim().startsWith(fence[1] ?? ""); index += 1) {
        const raw = lines[index] ?? "";
        body.push(raw.slice(Math.min(margin, raw.length - raw.trimStart().length)));
      }
      replaceLast({ ...previous, docString: body.join("\n") });
    }
  }
  return scenarios;
}
