const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // The path to the Next.js app to load next.config.js and .env files in the test environment
  dir: './',
})

// Any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: '<rootDir>/jest-environment-jsdom-with-reconfigure.js',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
}

// Export to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
