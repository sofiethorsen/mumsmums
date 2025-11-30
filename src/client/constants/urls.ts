import { PRODUCTION_HOST } from './hosts'

// Get the base URL for the application (used for Open Graph meta tags)
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_BASE_URL || PRODUCTION_HOST
}

// Convert a relative URL to an absolute URL
// e.g., "/images/recipes/43985745104896.webp" -> "https://mumsmums.app/images/recipes/43985745104896.webp"
export function toAbsoluteUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const baseUrl = getBaseUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
