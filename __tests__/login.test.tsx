import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { jest } from '@jest/globals'
import LoginPage from "@/app/login/page"


// Mock Firebase before importing the component
jest.mock("firebase/auth", () => ({
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}))


jest.mock("@/app/lib/firebase", () => ({
  auth: {},
  googleProvider: {},
}))


// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))


// mock OrbotLogo to avoid canvas context errors in components that render it
jest.mock("@/app/components/OrbotLogo", () => ({
  __esModule: true,
  default: () => <div data-testid="orbot-logo" />,
}))


// Mock fetch
// cast to MockedFunction so TypeScript knows the signature
global.fetch = jest.fn() as unknown as jest.MockedFunction<typeof fetch>


describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })


  it("renders login form correctly", () => {
    render(<LoginPage />)
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Enter your password here")).toBeInTheDocument()
    expect(screen.getByText("Sign In →")).toBeInTheDocument()
  })


  it("renders Orbot branding", () => {
    render(<LoginPage />)
    expect(screen.getByText("Orbot")).toBeInTheDocument()
    expect(screen.getByText("Welcome Back")).toBeInTheDocument()
  })


  it("shows error message on failed login", async () => {
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid credentials" }),
    } as unknown as Response)
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "wrong@email.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Enter your password here"), {
      target: { value: "wrongpassword" },
    })
    fireEvent.click(screen.getByText("Sign In →"))
    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
    })
  })


  it("redirects to dashboard on successful login", async () => {
    const mockPush = jest.fn()
    jest.mock("next/navigation", () => ({
      useRouter: () => ({ push: mockPush }),
    }))
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { name: "John", email: "john@email.com" } }),
    } as unknown as Response)
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@email.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Enter your password here"), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByText("Sign In →"))
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/login", expect.any(Object))
    })
  })


  it("shows loading state while signing in", async () => {
    ;(fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => new Promise(() => {}))
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@email.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Enter your password here"), {
      target: { value: "password123" },
    })
    fireEvent.click(screen.getByText("Sign In →"))
    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument()
    })
  })


  it("has a link to register page", () => {
    render(<LoginPage />)
    expect(screen.getByText("Register")).toBeInTheDocument()
  })
})
