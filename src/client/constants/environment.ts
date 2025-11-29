// Determine backend URL at runtime - if it's not the browser, we assume it's build time (SSR)
const isBrowser = typeof window !== 'undefined'

// On localhost:3000 -> use localhost:8080 (local dev)
// On any other host -> use empty string for relative URLs (Caddy proxy)
const isLocalDev = isBrowser && window.location.hostname === 'localhost'

// For SSR, always use localhost:8080
export const BACKEND_BASE_URI = isBrowser
  ? (isLocalDev ? "http://localhost:8080" : "")
  : "http://localhost:8080"
