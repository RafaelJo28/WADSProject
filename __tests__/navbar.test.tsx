import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { jest } from '@jest/globals'
import Navbar from "@/app/components/Navbar"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock("@/app/components/OrbotLogo", () => ({
  __esModule: true,
  default: () => <div data-testid="orbot-logo" />,
}))

// ensure the fetch mock is properly typed so TS doesn’t complain
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders Orbot logo and brand name", () => {
    render(<Navbar />)
    expect(screen.getByText("Orbot")).toBeInTheDocument()
    expect(screen.getByTestId("orbot-logo")).toBeInTheDocument()
  })

  it("renders all navigation links", () => {
    render(<Navbar />)
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Ask")).toBeInTheDocument()
    expect(screen.getByText("History")).toBeInTheDocument()
    expect(screen.getByText("Profile")).toBeInTheDocument()
  })

  it("renders logout button", () => {
    render(<Navbar />)
    expect(screen.getByText("Logout")).toBeInTheDocument()
  })

  it("highlights active nav item", () => {
    render(<Navbar active="Dashboard" />)
    const dashboardLink = screen.getByText("Dashboard")
    expect(dashboardLink).toHaveClass("text-purple-400")
  })

  it("calls logout API and redirects on logout click", async () => {
    const mockPush = jest.fn()
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({ push: mockPush })
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({ ok: true } as unknown as Response)

    const mockLocalStorage = {
      removeItem: jest.fn(),
    }
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage })

    render(<Navbar />)
    fireEvent.click(screen.getByText("Logout"))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" })
    })
  })
})