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

// next/jest adds its own transformIgnorePatterns that block ESM packages.
// We wrap the config to replace them with a single pattern that also allows
// next-intl and its dependencies through.
const baseConfigFn = createJestConfig(customJestConfig)
module.exports = async () => {
  const config = await baseConfigFn()
  config.transformIgnorePatterns = [
    '/node_modules/(?!(next-intl|use-intl|intl-messageformat|@formatjs)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ]
  return config
}
