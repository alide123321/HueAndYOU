export default {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
    '^@testHelpers/(.*)$': '<rootDir>/Tests/testHelpers/$1',
  },
};