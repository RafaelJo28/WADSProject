import "@testing-library/jest-dom"


// Polyfill fetch and related globals for Firebase auth in Node.js test environment
const fetch = require('node-fetch')
global.fetch = fetch
global.Response = fetch.Response
global.Request = fetch.Request
global.Headers = fetch.Headers
