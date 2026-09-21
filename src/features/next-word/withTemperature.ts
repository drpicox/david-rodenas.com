import type { Candidate } from "./NextWordModel";

/**
 * The same dial a real model has. Each chance is raised to 1/temperature and
 * the lot made to add up to one again: below 1 the likely get likelier, above
 * it the chances even out, and at zero the model always says the same thing.
 */
export function withTemperature(candidates: readonly Candidate[], temperature: number): Candidate[] {
  if (temperature <= 0) return candidates.map((candidate, index) => ({ ...candidate, probability: index === 0 ? 1 : 0 }));
  const raised = candidates.map((candidate) => candidate.probability ** (1 / temperature));
  const total = raised.reduce((a, b) => a + b, 0);
  return candidates.map((candidate, index) => ({ ...candidate, probability: (raised[index] ?? 0) / total }));
}
