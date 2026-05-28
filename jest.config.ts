import type { Config } from "jest"

const config: Config = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest.setupAfterEnv.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^next/link$": "<rootDir>/__mocks__/next/link.tsx",
    "^next/navigation$": "<rootDir>/__mocks__/next/navigation.ts",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      }
    }]
  },
  testEnvironmentOptions: {
    customExportConditions: ["react-jsx"],
  },
  // Memory optimizations
  workerIdleMemoryLimit: "512MB",
  maxWorkers: 2,
  testTimeout: 30000,
  // Prevent memory leaks
  forceExit: true,
  detectOpenHandles: true,
}

export default config