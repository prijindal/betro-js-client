const commonConfig = {
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  collectCoverageFrom: ["src/**/*.ts"],
  testMatch: ["**/test/**/*.test.(ts|js)", "**/src/**/*.test.(ts|js)"],
  testTimeout: 5000,
};

module.exports = {
  projects: [
    {
      ...commonConfig,
      testEnvironment: "node",
    },
    {
      ...commonConfig,
      preset: "jest-puppeteer",
    },
  ],
};
