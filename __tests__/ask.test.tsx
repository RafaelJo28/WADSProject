import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { jest } from '@jest/globals'
import AskPage from "@/app/ask/page"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock("@/app/components/Navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar" />,
}))

jest.mock("@/app/components/Stars", () => ({
  __esModule: true,
  default: () => <div data-testid="stars" />,
}))

global.fetch = jest.fn() as unknown as jest.MockedFunction<typeof fetch>

describe("Ask Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders ask page heading", () => {
    render(<AskPage />)
    expect(screen.getByText("Ask Orbot")).toBeInTheDocument()
  })

  it("renders all subject buttons", () => {
    render(<AskPage />)
    const subjects = ["Math", "Science", "Physics", "Chemistry", "Biology", "History", "English", "Other"]
    subjects.forEach(subject => {
      expect(screen.getByText(subject)).toBeInTheDocument()
    })
  })

  it("selects a subject when clicked", () => {
    render(<AskPage />)
    fireEvent.click(screen.getByText("Math"))
    const mathButton = screen.getByText("Math")
    expect(mathButton).toBeInTheDocument()
  })

  it("renders question textarea", () => {
    render(<AskPage />)
    expect(screen.getByPlaceholderText("Type your homework question here...")).toBeInTheDocument()
  })

  it("submit button is disabled when no subject selected", () => {
    render(<AskPage />)
    const submitButton = screen.getByText("✨ Get Explanation")
    expect(submitButton).toBeDisabled()
  })

  it("submit button is enabled when subject is selected", () => {
    render(<AskPage />)
    fireEvent.click(screen.getByText("Math"))
    const submitButton = screen.getByText("✨ Get Explanation")
    expect(submitButton).not.toBeDisabled()
  })

  it("shows loading state when submitting", async () => {
    ;(fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => new Promise(() => {}))
    render(<AskPage />)
    fireEvent.click(screen.getByText("Math"))
    fireEvent.change(screen.getByPlaceholderText("Type your homework question here..."), {
      target: { value: "What is 2 + 2?" },
    })
    fireEvent.click(screen.getByText("✨ Get Explanation"))
    await waitFor(() => {
      expect(screen.getByText("Orbot is thinking...")).toBeInTheDocument()
    })
  })

  it("shows error on failed submission", async () => {
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ error: "Something went wrong" }),
    } as unknown as Response)
    render(<AskPage />)
    fireEvent.click(screen.getByText("Math"))
    fireEvent.change(screen.getByPlaceholderText("Type your homework question here..."), {
      target: { value: "What is 2 + 2?" },
    })
    fireEvent.click(screen.getByText("✨ Get Explanation"))
    await waitFor(() => {
      expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    })
  })

  it("renders image upload zone", () => {
    render(<AskPage />)
    expect(screen.getByText("Click to upload a photo of your homework")).toBeInTheDocument()
  })
})