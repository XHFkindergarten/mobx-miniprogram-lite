import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  bail: 1,
  verbose: true,
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  testMatch: ['**/tests/**/*.spec.[jt]s?(x)'],
  testTimeout: 600000,
  // snapshotSerializers: ['miniprogram-simulate/jest-snapshot-plugin']
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.{js,ts}', '!**/tests/**']
  // globalTeardown: './scripts/jestGlobalTeardown.js',
  // testEnvironment: './scripts/jestEnv.js',
  // setupFilesAfterEnv: ['./scripts/jestPerTestSetup.ts'],
  // jest 内置 jsdom，所以不需要额外引入。
  // 配置 jest-snapshot-plugin 从而在使用 jest 的 snapshot 功能时获得更加适合肉眼阅读的结构
  // maxWorkers: '100%',
  // maxConcurrency: 1
}

export default config
