// Polyfill fetch and related globals for Firebase auth in Node.js test environment
const fetch = require('node-fetch')
global.fetch = fetch
global.Response = fetch.Response
global.Request = fetch.Request
global.Headers = fetch.Headers

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
  }
})
