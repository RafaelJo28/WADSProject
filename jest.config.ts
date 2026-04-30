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
}

export default config