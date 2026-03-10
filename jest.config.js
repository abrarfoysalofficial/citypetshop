/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  preset: "ts-jest",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/tests/unit/**/*.test.ts"],
};

module.exports = config;
