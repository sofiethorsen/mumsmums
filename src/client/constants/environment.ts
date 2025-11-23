// Allow NEXT_PUBLIC_BACKEND_URL to directly override backend URL (for Docker)
// Or NEXT_PUBLIC_USE_LOCAL_BACKEND to use localhost (for build scripts)
const isProd = process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_USE_LOCAL_BACKEND

export const BACKEND_BASE_URI =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (isProd ? "https://mumsmums.app" : "http://localhost:8080")
