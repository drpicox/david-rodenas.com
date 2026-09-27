/**
 * The event a program's host hears when it is asked from outside the page's
 * own dials. An event, and not a registry of mounted programs, because the
 * host is already the thing that is there or not: nothing has to be kept in
 * step with the page when it changes.
 */
export const PROGRAM_ASKED = "program-asked";
