module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  coveragePathIgnorePatterns: ["/node_modules/"],
};
