/**
 * Determines the backend URL for API requests across different environments.
 */

// Determine execution environment
const isBrowser = typeof window !== 'undefined'
const isServerSide = !isBrowser

// Browser environment detection
const isLocalDevBrowser = isBrowser && window.location.hostname === 'localhost'
const isProductionBrowser = isBrowser && !isLocalDevBrowser

// Server-side environment detection (SSR/build time)
const isDockerBuild = isServerSide && !!process.env.BACKEND_URL

export const BACKEND_BASE_URI =
  isLocalDevBrowser ? 'http://localhost:8080' :  // Local dev browser: direct connection to local backend
  isProductionBrowser ? '' :                      // Production browser: relative URLs (proxied by Caddy)
  isDockerBuild ? process.env.BACKEND_URL! :     // Docker build: use container network (e.g., http://backend:8080)
  'http://localhost:8080'                         // Local dev SSR: direct connection to local backend
