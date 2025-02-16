module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "ts-jest",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.jest.json",
    },
  },
};
