export default {
  testEnvironment: 'node',

  // Map module paths to simplify imports
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@testHelpers/(.*)$': '<rootDir>/Tests/testHelpers/$1',
  },

  // Keep unit tests fast and deterministic
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,

  // Good defaults for “real” reporting
  verbose: true,

  // Where Jest writes coverage (optional)
  collectCoverage: false,
  coverageDirectory: path.join(RESULTS_DIR, "coverage"),

  // Add file-based reports while keeping console output
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: RESULTS_DIR,
        outputName: "junit.xml",
        ancestorSeparator: " > ",
        suiteNameTemplate: "{filepath}",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
    [
      "jest-html-reporters",
      {
        publicPath: RESULTS_DIR,
        filename: "report.html",
        expand: true,
      },
    ],
  ],
};