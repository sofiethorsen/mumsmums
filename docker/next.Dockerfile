FROM node:20

WORKDIR /app

# Copy package files and install only production dependencies
COPY src/client/package*.json ./
RUN npm ci --omit=dev

# Copy the pre-built Next.js app from local build
# This was built with localhost:8080 which works with host networking
COPY src/client/.next ./.next
COPY src/client/public ./public

EXPOSE 3000

CMD ["npm", "start"]
