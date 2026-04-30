export function useRouter() {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }
}

export function useSearchParams() {
  return new URLSearchParams()
}

export function usePathname() {
  return '/'
}

export function useParams() {
  return {}
}
