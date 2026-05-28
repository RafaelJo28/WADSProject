import fetch, { Response, Request, Headers } from 'node-fetch'
import React from 'react'

global.fetch = fetch as unknown as typeof global.fetch
global.Response = Response as unknown as typeof global.Response
global.Request = Request as unknown as typeof global.Request
global.Headers = Headers as unknown as typeof global.Headers

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

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => 
    React.createElement('a', { href, ...props }, children),
}))