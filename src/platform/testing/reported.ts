/** An error as a test runner reports it: its kind, then what it says. */
export function reported(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error);
}
