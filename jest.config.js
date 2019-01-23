// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // A set of global variables that need to be available in all test environments
  globals: {
    "ts-jest": {
      "tsConfig": "tsconfig.json"
    }
  },

  // An array of file extensions your modules use
  moduleFileExtensions: [
    "ts",
    "js"
  ],
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    "**/__tests__/*.+(ts|js)"
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },

  // Whether to use watchman for file crawling
  watchman: false,
};
