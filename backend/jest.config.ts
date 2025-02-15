import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest", // Use ts-jest for TypeScript
  testEnvironment: "node", // Test environment
  moduleFileExtensions: ["ts", "tsx", "js"], // File extensions to test
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest", // Transform TypeScript files
  },
  testMatch: ["**/tests/**/*.test.(ts|js)"], // Test file pattern
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Optional: Map aliases for imports
  },
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json", // Use your TypeScript config
    },
  },
};

export default config;
