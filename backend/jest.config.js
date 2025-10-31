// jest.config.js
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  coveragePathIgnorePatterns: ["/node_modules/", "/tests/"],
};
