#!/usr/bin/env bash

set -euo pipefail

GIT_DIR=$(git rev-parse --show-toplevel)
cd "$GIT_DIR" || exit 1

# Clean up any existing containers and network
echo "Cleaning up existing containers..."
docker rm -f mumsmums next 2>/dev/null || true
docker network rm app_net 2>/dev/null || true

# Build sources (this builds both backend and frontend with localhost:8080)
./ci/build-sources.sh

# Create docker network
echo "Creating docker network..."
docker network create app_net

# Build images
echo "Building docker images..."
docker build -t mumsmums -f docker/mumsmums.Dockerfile .
docker build -t next -f docker/next.Dockerfile .

# Run backend container
echo "Starting mumsmums server..."
docker run -d --network app_net --name mumsmums -p 8080:8080 mumsmums

# Wait for backend to be ready
echo "Waiting for server to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8080/graphql > /dev/null 2>&1; then
        echo "Server is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Server failed to start"
        docker logs mumsmums
        exit 1
    fi
    sleep 1
done

# Run frontend container with link to backend
echo "Starting Next.js frontend..."
docker run -d --network app_net --name next -p 3000:3000 --add-host=localhost:host-gateway next

echo "Done! Application is running:"
echo "  - Backend: http://localhost:8080"
echo "  - Frontend: http://localhost:3000"
