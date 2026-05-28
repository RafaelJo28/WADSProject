import "@testing-library/jest-dom"

const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  const serialize = (value: unknown): string => {
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    if (Array.isArray(value)) return value.map(serialize).join(" ")
    if (value && typeof value === "object") {
      if (typeof (value as Record<string, unknown>).message === "string") {
        return (value as Record<string, unknown>).message as string
      }
      if (typeof (value as Record<string, unknown>).toString === "function") {
        const text = (value as { toString(): string }).toString()
        if (text !== "[object Object]") return text
      }
      try {
        return JSON.stringify(value)
      } catch {
        return String(value)
      }
    }
    return String(value)
  }

  const formatArgs = (args: unknown[]) => args.map(serialize).join(" ")

  console.error = (...args: unknown[]) => {
    const message = formatArgs(args)
    if (
      message.includes("Received `true` for a non-boolean attribute `jsx`") ||
      message.includes("Warning: React.jsx: type is invalid") ||
      message.includes("Element type is invalid")
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args: unknown[]) => {
    const message = formatArgs(args)
    if (message.includes("An error occurred in the")) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})