module.exports = {
  // Use node environment instead of jsdom since we don't need DOM
  testEnvironment: "node",
  // For TypeScript projects
  preset: "ts-jest",
  moduleNameMapper: {
    // Handle Next.js path aliases
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};
