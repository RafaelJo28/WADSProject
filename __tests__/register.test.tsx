import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { jest } from '@jest/globals'
import RegisterPage from "@/app/register/page"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

// mock OrbotLogo to avoid canvas context issues during tests
jest.mock("@/app/components/OrbotLogo", () => ({
  __esModule: true,
  default: () => <div data-testid="orbot-logo" />,
}))

global.fetch = jest.fn() as unknown as jest.MockedFunction<typeof fetch>

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders register form correctly", () => {
    render(<RegisterPage />)
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
    expect(screen.getByText("Create Account →")).toBeInTheDocument()
  })

  it("renders Orbot branding", () => {
    render(<RegisterPage />)
    expect(screen.getByText("Orbot")).toBeInTheDocument()
    expect(screen.getByText("Create Account")).toBeInTheDocument()
  })

  it("shows error on failed registration", async () => {
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Email already exists" }),
    } as unknown as Response)
    render(<RegisterPage />)
    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "existing@email.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Enter your password here"), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByText("Create Account →"))
    await waitFor(() => {
      expect(screen.getByText("Email already exists")).toBeInTheDocument()
    })
  })

  it("redirects to login on successful registration", async () => {
    const mockPush = jest.fn()
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({ push: mockPush })
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as unknown as Response)
    render(<RegisterPage />)
    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@email.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Enter your password here"), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByText("Create Account →"))
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/register", expect.any(Object))
    })
  })

  it("shows loading state while creating account", async () => {
    ;(fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => new Promise(() => {}))
    render(<RegisterPage />)
    fireEvent.change(screen.getByPlaceholderText("John Doe"), {
      target: { value: "John" },
    })
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@email.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Enter your password here"), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByText("Create Account →"))
    await waitFor(() => {
      expect(screen.getByText("Creating account...")).toBeInTheDocument()
    })
  })

  it("has a link to login page", () => {
    render(<RegisterPage />)
    expect(screen.getByText("Sign in")).toBeInTheDocument()
  })
})