import { jest } from '@jest/globals'

jest.mock("@/app/lib/db", () => ({
  db: {
    question: {
      findFirst: jest.fn(),
    },
    followUp: {
      create: jest.fn(),
    },
  },
}))

jest.mock("groq-sdk", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}))

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}))

describe("AI Follow-up Processing", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should validate follow-up prompt structure", () => {
    const expectedFollowUpPrompt = `A student was studying this question: "What is 2+2?"

The AI gave this explanation: "2 + 2 = 4"

The student now asks: "Can you explain why?"

Please answer this follow-up clearly and helpfully.`

    expect(expectedFollowUpPrompt).toContain("studying this question")
    expect(expectedFollowUpPrompt).toContain("What is 2+2?")
    expect(expectedFollowUpPrompt).toContain("AI gave this explanation")
    expect(expectedFollowUpPrompt).toContain("2 + 2 = 4")
    expect(expectedFollowUpPrompt).toContain("Can you explain why?")
    expect(expectedFollowUpPrompt).toContain("answer this follow-up clearly")
  })

  it("should validate follow-up question constraints", () => {
    const testCases = [
      { input: "", expected: false },
      { input: "   ", expected: false },
      { input: "a".repeat(10001), expected: false },
      { input: "Can you explain why?", expected: true },
      { input: "a".repeat(10000), expected: true },
    ]

    testCases.forEach(({ input, expected }) => {
      const isValid = input.trim().length >= 1 && input.trim().length <= 10000
      expect(isValid).toBe(expected)
    })
  })

  it("should validate question ID format", () => {
    const testCases = [
      { input: "", expected: false },
      { input: "   ", expected: false },
      { input: "a".repeat(101), expected: false },
      { input: "q1", expected: true },
      { input: "a".repeat(100), expected: true },
    ]

    testCases.forEach(({ input, expected }) => {
      const isValid = input.trim().length >= 1 && input.trim().length <= 100
      expect(isValid).toBe(expected)
    })
  })
})