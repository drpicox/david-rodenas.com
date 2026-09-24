/**
 * The chance, on each of a term's twenty-one working days, that a subject
 * brings an exam's worth of work or a lab's. Copied as they were in 1999: the
 * labs peak a few days before the exams, and the exams on the last day of class.
 */
export const ODDS = {
  exams: [0.01, 0.01, 0.02, 0.01, 0.05, 0.2, 0.05, 0.1, 0.2, 0.3, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.1, 0.3, 0.8, 1.0, 0.4],
  labs: [0.01, 0.02, 0.03, 0.04, 0.06, 0.09, 0.12, 0.17, 0.23, 0.32, 0.44, 0.48, 0.58, 0.78, 0.87, 0.89, 0.78, 0.75, 0.62, 0.45, 0.2],
} as const;
