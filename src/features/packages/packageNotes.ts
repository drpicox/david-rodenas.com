/** What the packages worth a row are, in a line each. The rest are counted together. */
export const packageNotes: Readonly<Record<string, string>> = {
  "string-cache-map": "a WeakMap replacement for string keys, with a bounded cache behind it",
  "async-barrier": "a helper that makes async/await tests say what they wait for",
  "spy-middleware": "a Redux middleware for spying on actions in tests",
  "grunt-frontmatter": "a Grunt task: many files with YAML front matter into one JSON",
  "object-canonical-keys": "always the same array of keys for the same keys, so comparisons stay cheap",
  "async-deferrer": "one function that returns a promise, or resolves it",
};
