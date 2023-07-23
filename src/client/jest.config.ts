import type { Config } from 'jest'

const config: Config = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/*.config.{ts,tsx}'
  ],
  moduleNameMapper: {
    '\\.(css)$': 'identity-obj-proxy',
    '\\.(png|svg|jpg|jpeg|gif)$': 'jest-transform-stub'
  },
};

export default config
