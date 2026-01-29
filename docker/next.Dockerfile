# =============================================================================
# Stage 1: Dependencies - Install npm dependencies
# =============================================================================
FROM node:20 AS deps

WORKDIR /build

# Copy package files
COPY src/client/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# =============================================================================
# Stage 2: Builder - Build the Next.js application
# =============================================================================
FROM node:20 AS builder

WORKDIR /build

# Copy dependencies from deps stage
COPY --from=deps /build/node_modules ./node_modules
COPY src/client/package*.json ./

# Copy source code
COPY src/client/ ./

# Build argument for backend URL during build (for SSR/SSG)
# Default to backend:8080 (works in production), but can be overridden to host.docker.internal:8080 for local builds
ARG NEXT_PUBLIC_BACKEND_URL=http://backend:8080

# Build the application
# This will run getStaticProps and connect to the backend
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
RUN npm run build

# =============================================================================
# Stage 3: Runtime - Minimal production image
# =============================================================================
FROM node:20

# Create a non-root user and group
RUN groupadd appuser -g 1001 && \
    useradd -u 1001 -g appuser appuser

WORKDIR /app

# Copy package files and install only production dependencies
COPY --from=builder /build/package*.json ./
RUN npm ci --omit=dev

# Copy the built Next.js app from builder stage
COPY --from=builder --chown=appuser:appuser /build/.next ./.next
COPY --from=builder --chown=appuser:appuser /build/public ./public

# Copy next.config.js if it exists
COPY --from=builder /build/next.config.* ./

# Create images directory for volume mount
RUN mkdir -p /app/public/images && chown appuser:appuser /app/public/images

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
