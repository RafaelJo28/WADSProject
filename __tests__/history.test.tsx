import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { jest } from '@jest/globals'
import HistoryPage from "@/app/history/page"

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

const mockQuestions = [
  { id: "1", content: "What is photosynthesis?", subject: "Biology", status: "answered", createdAt: "2024-01-01" },
  { id: "2", content: "Solve x + 2 = 5", subject: "Math", status: "answered", createdAt: "2024-01-02" },
  { id: "3", content: "What caused WW2?", subject: "History", status: "pending", createdAt: "2024-01-03" },
]

global.fetch = jest.fn() as unknown as jest.MockedFunction<typeof fetch>

const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, "localStorage", { value: mockLocalStorage })

describe("History Page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.setItem("user", JSON.stringify({ name: "John" }))
    mockLocalStorage.setItem("bookmarks", JSON.stringify([]))
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockQuestions,
    } as unknown as Response)
  })

  it("renders history heading", async () => {
    render(<HistoryPage />)
    await waitFor(() => {
      expect(screen.getByText("History")).toBeInTheDocument()
    })
  })

  it("renders questions after loading", async () => {
    render(<HistoryPage />)
    await waitFor(() => {
      expect(screen.getByText("What is photosynthesis?")).toBeInTheDocument()
      expect(screen.getByText("Solve x + 2 = 5")).toBeInTheDocument()
    })
  })

  it("filters questions by search", async () => {
    render(<HistoryPage />)
    await waitFor(() => screen.getByText("What is photosynthesis?"))
    fireEvent.change(screen.getByPlaceholderText("Search questions..."), {
      target: { value: "photosynthesis" },
    })
    expect(screen.getByText("What is photosynthesis?")).toBeInTheDocument()
    expect(screen.queryByText("Solve x + 2 = 5")).not.toBeInTheDocument()
  })

  it("filters questions by status", async () => {
    render(<HistoryPage />)
    await waitFor(() => screen.getByText("What caused WW2?"))
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "pending" },
    })
    expect(screen.getByText("What caused WW2?")).toBeInTheDocument()
    expect(screen.queryByText("What is photosynthesis?")).not.toBeInTheDocument()
  })

  it("toggles bookmark on star click", async () => {
    render(<HistoryPage />)
    await waitFor(() => screen.getAllByText("☆"))
    const stars = screen.getAllByText("☆")
    fireEvent.click(stars[0])
    await waitFor(() => {
      expect(screen.getByText("⭐")).toBeInTheDocument()
    })
  })

  it("shows empty state when no questions", async () => {
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as unknown as Response)
    render(<HistoryPage />)
    await waitFor(() => {
      expect(screen.getByText("No questions found.")).toBeInTheDocument()
    })
  })

  it("deletes a question after confirmation", async () => {
    window.confirm = jest.fn(() => true)
    ;(fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({ ok: true, json: async () => mockQuestions } as unknown as Response)
      .mockResolvedValueOnce({ ok: true } as unknown as Response)

    render(<HistoryPage />)
    await waitFor(() => screen.getAllByText("Delete"))
    fireEvent.click(screen.getAllByText("Delete")[0])
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/questions/1", { method: "DELETE" })
    })
  })

  it("enters rename mode on Rename click", async () => {
    render(<HistoryPage />)
    await waitFor(() => screen.getAllByText("Rename"))
    fireEvent.click(screen.getAllByText("Rename")[0])
    expect(screen.getByDisplayValue("What is photosynthesis?")).toBeInTheDocument()
  })

  it("cancels rename on Escape key", async () => {
    render(<HistoryPage />)
    await waitFor(() => screen.getAllByText("Rename"))
    fireEvent.click(screen.getAllByText("Rename")[0])
    fireEvent.keyDown(screen.getByDisplayValue("What is photosynthesis?"), { key: "Escape" })
    expect(screen.queryByDisplayValue("What is photosynthesis?")).not.toBeInTheDocument()
  })
})