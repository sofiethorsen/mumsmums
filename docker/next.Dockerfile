FROM node:20

# Create a non-root user and group
RUN groupadd -r appuser -g 1001 && \
    useradd -r -u 1001 -g appuser appuser

WORKDIR /app

# Copy package files and install only production dependencies
COPY src/client/package*.json ./
RUN npm ci --omit=dev

# Copy the pre-built Next.js app from local build
# This was built with localhost:8080 which works with host networking
COPY src/client/.next ./.next
COPY src/client/public ./public

# Set ownership of app directory to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

EXPOSE 3000

CMD ["npm", "start"]
