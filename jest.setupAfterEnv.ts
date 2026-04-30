import "@testing-library/jest-dom"

// Suppress React JSX warnings and other console noise in tests
const originalError = console.error
const originalWarn = console.warn
beforeAll(() => {
  const formatArgs = (args: any[]) => {
    const serialize = (value: any): string => {
      if (typeof value === "string") return value
      if (typeof value === "number" || typeof value === "boolean") return String(value)
      if (Array.isArray(value)) return value.map(serialize).join(" ")
      if (value && typeof value === "object") {
        if (typeof value.message === "string") return value.message
        if (typeof value.toString === "function") {
          const text = value.toString()
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
    return args.map(serialize).join(" ")
  }

  console.error = (...args: any) => {
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
  console.warn = (...args: any) => {
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