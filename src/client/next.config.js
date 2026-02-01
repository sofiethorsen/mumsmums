/**
 * Next.js Configuration
 *
 * Performance optimizations for production builds and image handling.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development warnings
    reactStrictMode: true,

    // Image optimization configuration
    images: {
        // Allowed image formats - WebP provides better compression than PNG/JPEG
        formats: ['image/webp'],

        // Device sizes for responsive images - Next.js generates optimized versions
        // for each size to serve the best image for the device
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],

        // Image sizes for different layout types
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },

    // Proxy /images to appropriate location based on environment
    // - Docker: proxy to Caddy which serves from volume mount
    // - Local dev: proxy to backend at localhost:8080
    async rewrites() {
        const isDocker = !!process.env.DOCKER_BACKEND_URL
        const imageDestination = isDocker
            ? 'http://caddy:80/images/:path*'
            : 'http://localhost:8080/images/:path*'

        return [
            {
                source: '/images/:path*',
                destination: imageDestination,
            },
        ]
    },

    ...(process.env.NODE_ENV === 'production' && {
        // Compress output files
        compress: true,
    }),
}

module.exports = nextConfig
