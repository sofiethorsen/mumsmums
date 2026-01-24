import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { BACKEND_BASE_URI } from './constants/environment'

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
        const response = await fetch(`${BACKEND_BASE_URI}/api/auth/status`, {
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
