import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Server-side middleware uses DOCKER_BACKEND_URL to communicate with backend container
// In Docker: http://backend:8080 (container network)
// In local dev: http://localhost:8080 (default)
const BACKEND_URL = process.env.DOCKER_BACKEND_URL || 'http://localhost:8080'

export async function proxy(request: NextRequest) {
    // Only protect /admin routes
    if (!request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.next()
    }

    // Check authentication by calling the backend
    try {
        const authToken = request.cookies.get('auth_token')?.value

        if (!authToken) {
            // No auth cookie, redirect to login
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Verify the token with the backend
        const response = await fetch(`${BACKEND_URL}/api/auth/status`, {
            headers: {
                Cookie: `auth_token=${authToken}`,
            },
        })

        if (!response.ok) {
            // Token invalid or expired, redirect to login
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Authenticated, allow access
        return NextResponse.next()
    } catch (error) {
        console.error('Auth check failed:', error)
        // On error, redirect to login to be safe
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }
}

export const config = {
    matcher: '/admin/:path*',
}
