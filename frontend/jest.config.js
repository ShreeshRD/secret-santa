module.exports = {
  preset: "ts-jest", // Uses ts-jest to compile TS/TSX files
  testEnvironment: "jsdom", // Provides a browser-like environment
  moduleNameMapper: {
    // Mock CSS modules and other non-JS files
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1", // Resolve your absolute imports
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "ts-jest", // Transpile files using ts-jest
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};
