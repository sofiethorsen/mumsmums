// Determine backend URL at runtime - if it's not the browser, we assume it's build time (SSR)
const isBrowser = typeof window !== 'undefined'

// On localhost:3000 -> use localhost:8080 (local dev)
// On any other host -> use empty string for relative URLs (Caddy proxy)
const isLocalDev = isBrowser && window.location.hostname === 'localhost'

// For SSR/build time:
// - Use NEXT_PUBLIC_BACKEND_URL if set (Docker multi-stage builds)
// - Otherwise default to localhost:8080 (local dev)
const serverSideBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"

export const BACKEND_BASE_URI = isBrowser
  ? (isLocalDev ? "http://localhost:8080" : "")
  : serverSideBackendUrl
