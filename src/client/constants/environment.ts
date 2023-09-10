const isProd = process.env.NODE_ENV === "production"

export const BACKEND_BASE_URI = isProd ? "https://mumsmums.app" : "http://localhost:8080"
