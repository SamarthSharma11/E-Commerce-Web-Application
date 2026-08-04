/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testMatch: ["**/src/tests/**/*.test.ts"],
  globalSetup: "<rootDir>/src/tests/setup.ts",
  globalTeardown: "<rootDir>/src/tests/teardown.ts",
  setupFilesAfterEnv: ["<rootDir>/src/tests/app.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@middleware/(.*)$": "<rootDir>/src/middleware/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
  },
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
};
