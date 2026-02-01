import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

/**
 * On-demand revalidation endpoint for Next.js ISR.
 *
 * This endpoint allows the backend to trigger revalidation of static pages
 * after recipe mutations (create, update, delete, image upload).
 *
 * Authentication: Requires a valid JWT token in the Authorization header.
 *
 * Usage from backend:
 *   POST /api/revalidate
 *   Headers: Authorization: Bearer <jwt_token>
 *   Body: { paths: ["/", "/recipe/123"] }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
        console.error('[Revalidate] JWT_SECRET is not configured')
        return res.status(500).json({ message: 'Server configuration error' })
    }

    try {
        jwt.verify(token, jwtSecret)
    } catch (err) {
        console.error('[Revalidate] JWT verification failed:', err)
        return res.status(401).json({ message: 'Invalid or expired token' })
    }

    const { paths } = req.body

    if (!paths || !Array.isArray(paths)) {
        return res.status(400).json({ message: 'paths array is required' })
    }

    try {
        const results = await Promise.allSettled(
            paths.map(async (path: string) => {
                await res.revalidate(path)
                return path
            })
        )

        const failed = results.filter(r => r.status === 'rejected')
        if (failed.length > 0) {
            console.error('[Revalidate] Some paths failed:', failed)
        }

        return res.json({
            revalidated: true,
            paths,
            timestamp: new Date().toISOString()
        })
    } catch (err) {
        console.error('[Revalidate] Error revalidating:', err)
        return res.status(500).json({ message: 'Error revalidating', error: String(err) })
    }
}
