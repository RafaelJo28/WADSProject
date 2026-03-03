import type { Config } from "jest"

const config: Config = {
  testEnvironment: "jsdom",
  // `setupFilesAfterEnv` is the correct key to include jest-dom matchers
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: { jsx: "react-jsx" }
    }]
  },
}

export default config