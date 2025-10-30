module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ["server.js", "models/**/*.js", "routes/**/*.js"],
};
