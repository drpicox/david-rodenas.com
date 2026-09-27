/**
 * What a reader can ask for. `toggle` is the only one that needs to know where
 * it started, and it only ever goes between light and dark: pink is asked for by name.
 */
export type ThemeChoice = "light" | "dark" | "system" | "pink" | "toggle";
